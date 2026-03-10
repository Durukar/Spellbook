export interface Buyer {
  id: string
  name: string
  phone: string
  instagram: string | null
  city: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CreateBuyerDto {
  name: string
  phone: string
  instagram?: string
  city?: string
  notes?: string
}

export interface UpdateBuyerDto {
  name?: string
  phone?: string
  instagram?: string
  city?: string
  notes?: string
}
