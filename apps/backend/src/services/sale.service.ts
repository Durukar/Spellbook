import { db } from '../db/client'
import type { Sale, SaleItem, CreateSaleDto, SaleStats, ShipmentEvent, ShippingStatus, AddTrackingDto } from '../types/sale'

interface SeuRastreioResponse {
  codigo: string
  status: string
  success: boolean
  eventoMaisRecente?: {
    codigo: string
    descricao: string
    detalhe?: string
    data: string
    local?: string
  }
}

interface ParsedEvent {
  codigo: string
  description: string
  location: string | null
  occurred_at: Date
}

const DESCRIPTION_TO_CODE: Record<string, string> = {
  'objeto postado': 'OL',
  'objeto em transferência': 'RO',
  'objeto em trânsito': 'RO',
  'objeto saiu para entrega': 'OEC',
  'objeto saiu para entrega ao destinatário': 'OEC',
  'objeto entregue ao destinatário': 'BDE',
  'entrega realizada': 'BDI',
  'tentativa de entrega não efetuada': 'BDR',
  'objeto devolvido': 'DEV',
  'objeto aguardando retirada': 'CMR',
  'objeto encaminhado': 'RO',
}

function descriptionToCode(description: string): string {
  const normalized = description.toLowerCase().trim()
  for (const [key, code] of Object.entries(DESCRIPTION_TO_CODE)) {
    if (normalized.startsWith(key)) return code
  }
  return 'INFO'
}

function parsePtBrDate(dateStr: string): Date | null {
  // Format: "13/03/2026, 07:34"
  const m = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4}),\s*(\d{2}):(\d{2})/)
  if (!m) return null
  return new Date(`${m[3]}-${m[2]}-${m[1]}T${m[4]}:${m[5]}:00`)
}

function stripHtmlComments(s: string): string {
  return s.replace(/<!--.*?-->/g, '').trim()
}

async function fetchFullHistory(trackingCode: string): Promise<ParsedEvent[]> {
  const response = await fetch(
    `https://seurastreio.com.br/objetos/${trackingCode}`,
    {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(25000),
    }
  )
  if (!response.ok) return []

  const html = await response.text()
  const events: ParsedEvent[] = []

  // Each event card contains an h4 with the description
  const cardRegex = /<h4[^>]*font-medium[^>]*>([^<]+)<\/h4>([\s\S]*?)(?=<h4[^>]*font-medium|<\/main|$)/g
  let match: RegExpExecArray | null

  while ((match = cardRegex.exec(html)) !== null) {
    const description = match[1].trim()
    const block = match[2]

    const dateMatch = block.match(/<span[^>]*>(\d{2}\/\d{2}\/\d{4},\s*\d{2}:\d{2})<\/span>/)
    if (!dateMatch) continue
    const occurred_at = parsePtBrDate(dateMatch[1])
    if (!occurred_at) continue

    // Origin: <span>CITY<!-- -->, <!-- -->UF</span> after map-pin icon
    const originMatch = block.match(/lucide-map-pin[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/)
    const origin = originMatch ? stripHtmlComments(originMatch[1]).replace(/\s+/g, ' ') : null

    // Destination: <div class="mt-1.5...">Destino: City<!-- -->, <!-- -->UF</div>
    const destMatch = block.match(/mt-1\.5[^>]*>Destino:?\s*([\s\S]*?)<\/div>/)
    const dest = destMatch ? stripHtmlComments(destMatch[1]).replace(/\s+/g, ' ').trim() : null

    const location = origin && dest
      ? `de ${origin} para ${dest}`
      : (origin ?? null)

    events.push({
      codigo: descriptionToCode(description),
      description,
      location,
      occurred_at,
    })
  }

  return events
}

function mapCorreiosCodeToStatus(code: string): ShippingStatus {
  const DELIVERED = ['BDE', 'BDI']
  const RETURNED = ['BDR', 'DEV']
  if (DELIVERED.includes(code)) return 'delivered'
  if (RETURNED.includes(code)) return 'returned'
  return 'in_transit'
}

export const saleService = {
  async create(dto: CreateSaleDto): Promise<Sale> {
    const client = await db.connect()
    try {
      await client.query('BEGIN')

      const stockRows = await client.query<{
        id: string
        card_name: string
        set_name: string
        image_url: string
        condition: string
        is_foil: boolean
        quantity: number
        purchase_price: number
      }>(
        `SELECT id, card_name, set_name, image_url, condition, is_foil, quantity, purchase_price
         FROM stock_items WHERE id = ANY($1::uuid[])`,
        [dto.items.map((i) => i.stock_item_id)]
      )

      const stockMap = new Map(stockRows.rows.map((r) => [r.id, r]))

      let totalAmount = 0
      let totalCost = 0

      for (const item of dto.items) {
        const stock = stockMap.get(item.stock_item_id)
        if (!stock) throw new Error(`Item de estoque nao encontrado: ${item.stock_item_id}`)
        if (stock.quantity < item.quantity) {
          throw new Error(`Quantidade insuficiente para: ${stock.card_name}`)
        }
        totalAmount += item.sale_price * item.quantity
        totalCost += Number(stock.purchase_price) * item.quantity
      }

      const discountAmount = Math.max(0, totalCost - totalAmount)

      const saleResult = await client.query<Sale>(
        `INSERT INTO sales (buyer_id, payment_method, notes, total_amount, discount_amount)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [dto.buyer_id ?? null, dto.payment_method, dto.notes ?? null, totalAmount, discountAmount]
      )
      const sale = saleResult.rows[0]

      const saleItems: SaleItem[] = []

      for (const item of dto.items) {
        const stock = stockMap.get(item.stock_item_id)!

        const itemResult = await client.query<SaleItem>(
          `INSERT INTO sale_items
             (sale_id, stock_item_id, card_name, set_name, image_url, condition, is_foil, quantity, purchase_price, sale_price)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
          [
            sale.id,
            item.stock_item_id,
            stock.card_name,
            stock.set_name,
            stock.image_url,
            stock.condition,
            stock.is_foil,
            item.quantity,
            stock.purchase_price,
            item.sale_price,
          ]
        )
        saleItems.push(itemResult.rows[0])

        const newQty = stock.quantity - item.quantity
        if (newQty <= 0) {
          await client.query('DELETE FROM stock_items WHERE id = $1', [item.stock_item_id])
        } else {
          await client.query(
            'UPDATE stock_items SET quantity = $1, updated_at = NOW() WHERE id = $2',
            [newQty, item.stock_item_id]
          )
        }
      }

      await client.query('COMMIT')
      return { ...sale, items: saleItems }
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  },

  async findAll(): Promise<Sale[]> {
    const salesResult = await db.query<Sale & { buyer_name: string | null }>(
      `SELECT s.*, b.name AS buyer_name
       FROM sales s
       LEFT JOIN buyers b ON b.id = s.buyer_id
       ORDER BY s.created_at DESC`
    )

    if (salesResult.rows.length === 0) return []

    const saleIds = salesResult.rows.map((s) => s.id)
    const itemsResult = await db.query<SaleItem>(
      'SELECT * FROM sale_items WHERE sale_id = ANY($1::uuid[]) ORDER BY created_at ASC',
      [saleIds]
    )

    const itemsBySaleId = new Map<string, SaleItem[]>()
    for (const item of itemsResult.rows) {
      const list = itemsBySaleId.get(item.sale_id) ?? []
      list.push(item)
      itemsBySaleId.set(item.sale_id, list)
    }

    return salesResult.rows.map((s) => ({ ...s, items: itemsBySaleId.get(s.id) ?? [] }))
  },

  async findById(id: string): Promise<Sale | null> {
    const saleResult = await db.query<Sale & { buyer_name: string | null }>(
      `SELECT s.*, b.name AS buyer_name
       FROM sales s
       LEFT JOIN buyers b ON b.id = s.buyer_id
       WHERE s.id = $1`,
      [id]
    )
    if (!saleResult.rows[0]) return null

    const itemsResult = await db.query<SaleItem>(
      'SELECT * FROM sale_items WHERE sale_id = $1 ORDER BY created_at ASC',
      [id]
    )

    const eventsResult = await db.query<ShipmentEvent>(
      'SELECT * FROM shipment_events WHERE sale_id = $1 ORDER BY occurred_at DESC',
      [id]
    )

    return { ...saleResult.rows[0], items: itemsResult.rows, shipment_events: eventsResult.rows }
  },

  async removeTracking(id: string): Promise<Sale | null> {
    const client = await db.connect()
    try {
      await client.query('BEGIN')
      await client.query('DELETE FROM shipment_events WHERE sale_id = $1', [id])
      const result = await client.query<Sale>(
        `UPDATE sales
         SET tracking_code = NULL,
             carrier = NULL,
             shipping_status = 'pending_shipment',
             shipped_at = NULL,
             delivered_at = NULL,
             updated_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [id]
      )
      await client.query('COMMIT')
      if (!result.rows[0]) return null
      return { ...result.rows[0], items: [], shipment_events: [] }
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  },

  async addTracking(id: string, dto: AddTrackingDto): Promise<Sale | null> {
    const result = await db.query<Sale>(
      `UPDATE sales
       SET tracking_code = $1,
           carrier = $2,
           shipping_status = 'shipped',
           shipped_at = NOW(),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [dto.tracking_code.trim().toUpperCase(), dto.carrier.trim(), id]
    )
    return result.rows[0] ?? null
  },

  async refreshTracking(id: string): Promise<Sale | null> {
    const saleResult = await db.query<Sale>('SELECT * FROM sales WHERE id = $1', [id])
    const sale = saleResult.rows[0]
    if (!sale || !sale.tracking_code) return null

    const apiKey = process.env.SEURASTREIO_API_KEY
    if (!apiKey) {
      throw new Error('Chave da API de rastreio nao configurada. Adicione SEURASTREIO_API_KEY no .env')
    }

    let data: SeuRastreioResponse
    try {
      const response = await fetch(
        `https://seurastreio.com.br/api/public/rastreio/${sale.tracking_code}`,
        {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          signal: AbortSignal.timeout(25000),
        }
      )
      if (response.status === 401) {
        throw new Error('API key invalida. Verifique SEURASTREIO_API_KEY no .env')
      }
      if (response.status === 404) {
        throw new Error('Codigo de rastreio nao encontrado nos Correios.')
      }
      if (!response.ok) {
        throw new Error(`Erro ao consultar rastreio (HTTP ${response.status}). Tente novamente.`)
      }
      data = await response.json() as SeuRastreioResponse
    } catch (err) {
      if (err instanceof Error) throw err
      throw new Error('Nao foi possivel consultar o rastreio. Verifique sua conexao e tente novamente.')
    }

    const eventoMaisRecente = data?.eventoMaisRecente
    if (!eventoMaisRecente) return this.findById(id)

    // Fetch full history from page (RSC), fallback to just the latest event
    const historyEvents = await fetchFullHistory(sale.tracking_code).catch(() => [])

    // Build final event list: start with full history, override latest with API data (has correct code)
    const allEvents: ParsedEvent[] = historyEvents.length > 0 ? historyEvents : [{
      codigo: eventoMaisRecente.codigo,
      description: [eventoMaisRecente.descricao, eventoMaisRecente.detalhe].filter(Boolean).join(' - '),
      location: eventoMaisRecente.local ?? null,
      occurred_at: new Date(eventoMaisRecente.data.replace(' ', 'T')),
    }]

    // Replace the most recent event's code with the accurate one from the API
    if (allEvents.length > 0) {
      allEvents[0].codigo = eventoMaisRecente.codigo
    }

    const client = await db.connect()
    try {
      await client.query('BEGIN')

      // Delete and reinsert to avoid duplicate events from timestamp precision differences
      await client.query('DELETE FROM shipment_events WHERE sale_id = $1', [id])

      for (const ev of allEvents) {
        await client.query(
          `INSERT INTO shipment_events (sale_id, event_code, description, location, occurred_at)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, ev.codigo, ev.description, ev.location, ev.occurred_at]
        )
      }

      const newStatus = mapCorreiosCodeToStatus(eventoMaisRecente.codigo)

      await client.query(
        `UPDATE sales
         SET shipping_status = $1,
             delivered_at = CASE WHEN $2 = 'delivered' AND delivered_at IS NULL THEN NOW() ELSE delivered_at END,
             updated_at = NOW()
         WHERE id = $3`,
        [newStatus, newStatus, id]
      )

      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }

    return this.findById(id)
  },

  async getStats(): Promise<SaleStats> {
    const totalResult = await db.query<{
      total_revenue: string
      total_cost: string
      total_discount: string
      sales_count: string
    }>(`
      SELECT
        COALESCE(SUM(s.total_amount), 0)   AS total_revenue,
        COALESCE(SUM(
          (SELECT SUM(si.purchase_price * si.quantity) FROM sale_items si WHERE si.sale_id = s.id)
        ), 0) AS total_cost,
        COALESCE(SUM(s.discount_amount), 0) AS total_discount,
        COUNT(s.id)                         AS sales_count
      FROM sales s
    `)

    const monthlyResult = await db.query<{
      monthly_revenue: string
      monthly_cost: string
      monthly_discount: string
      monthly_count: string
    }>(`
      SELECT
        COALESCE(SUM(s.total_amount), 0)   AS monthly_revenue,
        COALESCE(SUM(
          (SELECT SUM(si.purchase_price * si.quantity) FROM sale_items si WHERE si.sale_id = s.id)
        ), 0) AS monthly_cost,
        COALESCE(SUM(s.discount_amount), 0) AS monthly_discount,
        COUNT(s.id)                         AS monthly_count
      FROM sales s
      WHERE DATE_TRUNC('month', s.created_at) = DATE_TRUNC('month', NOW())
    `)

    const stockResult = await db.query<{ stock_value: string }>(
      'SELECT COALESCE(SUM(purchase_price * quantity), 0) AS stock_value FROM stock_items'
    )

    const t = totalResult.rows[0]
    const m = monthlyResult.rows[0]
    const totalRevenue = Number(t.total_revenue)
    const totalCost = Number(t.total_cost)
    const monthlyRevenue = Number(m.monthly_revenue)
    const monthlyCost = Number(m.monthly_cost)

    return {
      total_revenue: totalRevenue,
      total_cost: totalCost,
      total_profit: totalRevenue - totalCost,
      total_discount: Number(t.total_discount),
      sales_count: Number(t.sales_count),
      stock_value: Number(stockResult.rows[0].stock_value),
      monthly_revenue: monthlyRevenue,
      monthly_profit: monthlyRevenue - monthlyCost,
      monthly_discount: Number(m.monthly_discount),
      monthly_count: Number(m.monthly_count),
    }
  },
}
