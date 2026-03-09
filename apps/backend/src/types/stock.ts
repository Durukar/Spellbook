export type CardCondition = 'NM' | 'SP' | 'MP' | 'HP' | 'DMG'

export interface StockItem {
  id: string
  scryfall_id: string
  card_name: string
  set_name: string
  image_url: string
  purchase_price: number
  purchase_date: string
  condition: CardCondition
  quantity: number
  is_foil: boolean
  created_at: string
}

export interface CreateStockItemDto {
  scryfall_id: string
  card_name: string
  set_name: string
  image_url: string
  purchase_price: number
  condition: CardCondition
  quantity: number
  is_foil: boolean
}

export interface UpdateStockItemDto {
  quantity?: number
  purchase_price?: number
  condition?: CardCondition
  is_foil?: boolean
}
