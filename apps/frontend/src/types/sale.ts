export type PaymentMethod = 'pix' | 'dinheiro' | 'fiado' | 'cartao' | 'troca'

export type ShippingStatus =
  | 'pending_shipment'
  | 'shipped'
  | 'in_transit'
  | 'delivered'
  | 'returned'

export interface ShipmentEvent {
  id: string
  sale_id: string
  event_code: string
  description: string
  location: string | null
  occurred_at: string
  created_at: string
}

export interface AddTrackingPayload {
  tracking_code: string
  carrier: string
}

export interface BackendSaleItem {
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

export interface BackendSale {
  id: string
  buyer_id: string | null
  buyer_name: string | null
  payment_method: PaymentMethod
  notes: string | null
  total_amount: number
  discount_amount: number
  created_at: string
  updated_at: string
  items: BackendSaleItem[]
  tracking_code?: string | null
  carrier?: string | null
  shipping_status?: ShippingStatus
  shipped_at?: string | null
  delivered_at?: string | null
  shipment_events?: ShipmentEvent[]
}

export interface SaleItemPayload {
  stock_item_id: string
  quantity: number
  sale_price: number
}

export interface CreateSalePayload {
  buyer_id?: string
  payment_method: PaymentMethod
  notes?: string
  items: SaleItemPayload[]
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
