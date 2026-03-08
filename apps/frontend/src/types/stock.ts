import type { CardCondition } from '@/models/Stock'

export interface BackendStockItem {
  id: string
  scryfall_id: string
  card_name: string
  set_name: string
  image_url: string
  purchase_price: number
  purchase_date: string
  condition: CardCondition
  quantity: number
  created_at: string
}

export interface CreateStockItemPayload {
  scryfall_id: string
  card_name: string
  set_name: string
  image_url: string
  purchase_price: number
  condition: CardCondition
  quantity: number
}
