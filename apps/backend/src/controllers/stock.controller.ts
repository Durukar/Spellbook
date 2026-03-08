import type { Context } from 'hono'
import { stockService } from '../services/stock.service'
import type { CreateStockItemDto } from '../types/stock'

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
}
