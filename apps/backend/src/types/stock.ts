export type CardCondition = 'NM' | 'SP' | 'MP' | 'HP' | 'DMG'

export type AcquisitionType = 'purchase' | 'accumulated' | 'gift' | 'trade'

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
  acquisition_type: AcquisitionType
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
  acquisition_type?: AcquisitionType
}

export interface UpdateStockItemDto {
  quantity?: number
  purchase_price?: number
  condition?: CardCondition
  is_foil?: boolean
  acquisition_type?: AcquisitionType
}
