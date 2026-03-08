const SCRYFALL_BASE_URL = 'https://api.scryfall.com'

export interface ScryfallCard {
  id: string
  name: string
  set: string
  set_name: string
  collector_number: string
  rarity: 'common' | 'uncommon' | 'rare' | 'mythic'
  prices: {
    usd: string | null
    usd_foil: string | null
    eur: string | null
  }
  image_uris?: {
    small: string
    normal: string
    large: string
  }
  card_faces?: Array<{
    image_uris?: {
      small: string
      normal: string
      large: string
    }
  }>
}

export interface ScryfallSearchResult {
  data: ScryfallCard[]
  has_more: boolean
  total_cards: number
}

export const scryfallService = {
  async searchCards(query: string, page = 1): Promise<ScryfallSearchResult> {
    const params = new URLSearchParams({ q: query, page: String(page) })
    const res = await fetch(`${SCRYFALL_BASE_URL}/cards/search?${params}`, {
      headers: { Accept: 'application/json' },
    })

    if (!res.ok) {
      if (res.status === 404) return { data: [], has_more: false, total_cards: 0 }
      throw new Error(`Scryfall search failed: ${res.status}`)
    }

    return res.json<ScryfallSearchResult>()
  },

  async getCardById(id: string): Promise<ScryfallCard> {
    const res = await fetch(`${SCRYFALL_BASE_URL}/cards/${id}`, {
      headers: { Accept: 'application/json' },
    })

    if (!res.ok) throw new Error(`Card not found: ${id}`)

    return res.json<ScryfallCard>()
  },

  async getCardByName(name: string): Promise<ScryfallCard> {
    const params = new URLSearchParams({ exact: name })
    const res = await fetch(`${SCRYFALL_BASE_URL}/cards/named?${params}`, {
      headers: { Accept: 'application/json' },
    })

    if (!res.ok) throw new Error(`Card not found: ${name}`)

    return res.json<ScryfallCard>()
  },
}
