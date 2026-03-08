const SCRYFALL_BASE_URL = 'https://api.scryfall.com'

const SCRYFALL_HEADERS = {
  Accept: 'application/json',
  'User-Agent': 'SpellBook/1.0 (https://github.com/spellbook)',
}

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
  async searchCards(query: string, page = 1, includeMultilingual = false): Promise<ScryfallSearchResult> {
    const params = new URLSearchParams({ q: query, page: String(page) })
    if (includeMultilingual) {
      params.append('include_multilingual', 'true')
    }
    const res = await fetch(`${SCRYFALL_BASE_URL}/cards/search?${params}`, {
      headers: SCRYFALL_HEADERS,
    })

    if (!res.ok) {
      // 404 = no results for this query — not a fatal error
      if (res.status === 404) {
        return { data: [], has_more: false, total_cards: 0 }
      }
      throw new Error(`Scryfall search failed: ${res.status}`)
    }

    return res.json<ScryfallSearchResult>()
  },

  async getCardById(id: string): Promise<ScryfallCard> {
    const res = await fetch(`${SCRYFALL_BASE_URL}/cards/${id}`, {
      headers: SCRYFALL_HEADERS,
    })

    if (!res.ok) throw new Error(`Card not found: ${id}`)

    return res.json<ScryfallCard>()
  },

  async getCardByName(name: string): Promise<ScryfallCard> {
    const params = new URLSearchParams({ exact: name })
    const res = await fetch(`${SCRYFALL_BASE_URL}/cards/named?${params}`, {
      headers: SCRYFALL_HEADERS,
    })

    if (!res.ok) throw new Error(`Card not found: ${name}`)

    return res.json<ScryfallCard>()
  },

  async autocomplete(query: string): Promise<string[]> {
    const params = new URLSearchParams({ q: query })
    const res = await fetch(`${SCRYFALL_BASE_URL}/cards/autocomplete?${params}`, {
      headers: SCRYFALL_HEADERS,
    })

    if (!res.ok) throw new Error(`Autocomplete failed: ${res.status}`)

    const result = await res.json<{ data: string[] }>()
    return result.data
  },
}
