import type { Context } from 'hono'
import { buyerService } from '../services/buyer.service'
import type { CreateBuyerDto, UpdateBuyerDto } from '../types/buyer'

export const buyerController = {
  async create(c: Context) {
    const body = await c.req.json<CreateBuyerDto>()

    if (!body.name) {
      return c.json({ error: 'Nome e obrigatorio.' }, 400)
    }

    const buyer = await buyerService.create(body)
    return c.json(buyer, 201)
  },

  async findAll(c: Context) {
    const buyers = await buyerService.findAll()
    return c.json(buyers)
  },

  async update(c: Context) {
    const id = c.req.param('id')
    if (!id) return c.json({ error: 'ID obrigatorio.' }, 400)

    const body = await c.req.json<UpdateBuyerDto>()
    const buyer = await buyerService.update(id, body)

    if (!buyer) return c.json({ error: 'Comprador nao encontrado.' }, 404)
    return c.json(buyer)
  },

  async delete(c: Context) {
    const id = c.req.param('id')
    if (!id) return c.json({ error: 'ID obrigatorio.' }, 400)

    const deleted = await buyerService.delete(id)
    if (!deleted) return c.json({ error: 'Comprador nao encontrado.' }, 404)
    return c.body(null, 204)
  },
}
