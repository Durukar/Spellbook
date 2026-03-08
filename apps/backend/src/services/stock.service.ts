import { db } from '../db/client'
import type { StockItem, CreateStockItemDto } from '../types/stock'

export const stockService = {
  async create(dto: CreateStockItemDto): Promise<StockItem> {
    const result = await db.query<StockItem>(
      `INSERT INTO stock_items (scryfall_id, card_name, set_name, image_url, purchase_price, condition, quantity)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [dto.scryfall_id, dto.card_name, dto.set_name, dto.image_url, dto.purchase_price, dto.condition, dto.quantity]
    )
    return result.rows[0]
  },

  async findAll(): Promise<StockItem[]> {
    const result = await db.query<StockItem>(
      'SELECT * FROM stock_items ORDER BY created_at DESC'
    )
    return result.rows
  },
}
