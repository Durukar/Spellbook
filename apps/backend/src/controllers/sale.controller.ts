import type { Context } from 'hono'
import { saleService } from '../services/sale.service'
import type { CreateSaleDto, PaymentMethod } from '../types/sale'

const VALID_PAYMENT_METHODS: PaymentMethod[] = ['pix', 'dinheiro', 'fiado', 'cartao', 'troca']

export const saleController = {
  async create(c: Context) {
    const body = await c.req.json<CreateSaleDto>()

    if (!body.payment_method || !VALID_PAYMENT_METHODS.includes(body.payment_method)) {
      return c.json({ error: 'Forma de pagamento invalida.' }, 400)
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return c.json({ error: 'A venda deve conter ao menos um item.' }, 400)
    }

    for (const item of body.items) {
      if (!item.stock_item_id) return c.json({ error: 'stock_item_id obrigatorio em cada item.' }, 400)
      if (!item.quantity || item.quantity < 1) return c.json({ error: 'Quantidade invalida em um dos itens.' }, 400)
      if (item.sale_price == null || item.sale_price < 0) return c.json({ error: 'Preco de venda invalido.' }, 400)
    }

    try {
      const sale = await saleService.create(body)
      return c.json(sale, 201)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao registrar venda.'
      return c.json({ error: message }, 422)
    }
  },

  async list(c: Context) {
    const sales = await saleService.findAll()
    return c.json(sales)
  },

  async getById(c: Context) {
    const id = c.req.param('id')
    if (!id) return c.json({ error: 'ID obrigatorio.' }, 400)

    const sale = await saleService.findById(id)
    if (!sale) return c.json({ error: 'Venda nao encontrada.' }, 404)
    return c.json(sale)
  },

  async getStats(c: Context) {
    const stats = await saleService.getStats()
    return c.json(stats)
  },
}
