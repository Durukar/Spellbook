import type { Context } from 'hono'
import { stockService } from '../services/stock.service'
import type { CreateStockItemDto, UpdateStockItemDto } from '../types/stock'

export const stockController = {
  async create(c: Context) {
    const body = await c.req.json<CreateStockItemDto>()

    if (
      !body.scryfall_id ||
      !body.card_name ||
      !body.set_name ||
      !body.image_url ||
      !body.condition ||
      body.quantity == null
    ) {
      return c.json({ error: 'Dados insuficientes para cadastrar a carta.' }, 400)
    }

    const item = await stockService.create(body)
    return c.json(item, 201)
  },

  async findAll(c: Context) {
    const items = await stockService.findAll()
    return c.json(items)
  },

  async update(c: Context) {
    const id = c.req.param('id')
    if (!id) return c.json({ error: 'ID obrigatorio.' }, 400)

    const body = await c.req.json<UpdateStockItemDto>()
    const item = await stockService.update(id, body)

    if (!item) return c.json({ error: 'Item nao encontrado.' }, 404)
    return c.json(item)
  },

  async delete(c: Context) {
    const id = c.req.param('id')
    if (!id) return c.json({ error: 'ID obrigatorio.' }, 400)

    const deleted = await stockService.delete(id)
    if (!deleted) return c.json({ error: 'Item nao encontrado.' }, 404)
    return c.body(null, 204)
  },
}
