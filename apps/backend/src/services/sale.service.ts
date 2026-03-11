import { db } from '../db/client'
import type { Sale, SaleItem, CreateSaleDto, SaleStats } from '../types/sale'

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

    return { ...saleResult.rows[0], items: itemsResult.rows }
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
