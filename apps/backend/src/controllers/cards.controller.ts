import type { Context } from 'hono'
import { scryfallService } from '../services/scryfall.service'
import type { Env } from '../types/env'

export const cardsController = {
  async search(c: Context<{ Bindings: Env }>) {
    const query = c.req.query('q')
    const page = Number(c.req.query('page') ?? '1')
    const includeMultilingual = c.req.query('include_multilingual') === 'true'

    if (!query) {
      return c.json({ error: 'Query parameter "q" is required' }, 400)
    }

    try {
      const result = await scryfallService.searchCards(query, page, includeMultilingual)
      return c.json(result)
    } catch (err) {
      console.error('[cards.search] error:', err)
      return c.json({ error: 'Failed to search cards' }, 502)
    }
  },

  async getById(c: Context<{ Bindings: Env }>) {
    const id = c.req.param('id') ?? ''

    try {
      const card = await scryfallService.getCardById(id)
      return c.json(card)
    } catch {
      return c.json({ error: 'Card not found' }, 404)
    }
  },

  async getByName(c: Context<{ Bindings: Env }>) {
    const name = c.req.query('name')

    if (!name) {
      return c.json({ error: 'Query parameter "name" is required' }, 400)
    }

    try {
      const card = await scryfallService.getCardByName(name)
      return c.json(card)
    } catch {
      return c.json({ error: 'Card not found' }, 404)
    }
  },

  async autocomplete(c: Context<{ Bindings: Env }>) {
    const query = c.req.query('q')

    if (!query) {
      return c.json({ error: 'Query parameter "q" is required' }, 400)
    }

    try {
      const names = await scryfallService.autocomplete(query)
      return c.json({ data: names })
    } catch {
      return c.json({ error: 'Autocomplete failed' }, 502)
    }
  },
}
