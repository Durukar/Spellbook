export type PaymentMethod = 'pix' | 'dinheiro' | 'fiado' | 'cartao' | 'troca'

export interface Sale {
  id: string
  buyer_id: string | null
  payment_method: PaymentMethod
  notes: string | null
  total_amount: number
  discount_amount: number
  created_at: string
  updated_at: string
  buyer_name?: string | null
  items?: SaleItem[]
}

export interface SaleItem {
  id: string
  sale_id: string
  stock_item_id: string | null
  card_name: string
  set_name: string
  image_url: string
  condition: string
  is_foil: boolean
  quantity: number
  purchase_price: number
  sale_price: number
  created_at: string
}

export interface CreateSaleItemDto {
  stock_item_id: string
  quantity: number
  sale_price: number
}

export interface CreateSaleDto {
  buyer_id?: string
  payment_method: PaymentMethod
  notes?: string
  items: CreateSaleItemDto[]
}

export interface SaleStats {
  total_revenue: number
  total_cost: number
  total_profit: number
  total_discount: number
  sales_count: number
  stock_value: number
  monthly_revenue: number
  monthly_profit: number
  monthly_discount: number
  monthly_count: number
}
