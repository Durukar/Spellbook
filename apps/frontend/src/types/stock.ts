import type { CardCondition } from '@/models/Stock'

export type PriceCurrency = 'USD' | 'BRL'

export interface BackendStockItem {
  id: string
  scryfall_id: string
  card_name: string
  set_name: string
  image_url: string
  purchase_price: number
  price_currency: PriceCurrency
  purchase_date: string
  condition: CardCondition
  quantity: number
  is_foil: boolean
  created_at: string
}

export interface CreateStockItemPayload {
  scryfall_id: string
  card_name: string
  set_name: string
  image_url: string
  purchase_price: number
  price_currency: PriceCurrency
  condition: CardCondition
  quantity: number
  is_foil: boolean
}

export interface UpdateStockItemPayload {
  quantity?: number
  purchase_price?: number
  price_currency?: PriceCurrency
  condition?: CardCondition
  is_foil?: boolean
}

export interface SetCollection {
  set_name: string
  icon_svg_uri?: string
  unique_cards: number
  total_quantity: number
  total_value: number
  foil_count: number
  items: BackendStockItem[]
}
