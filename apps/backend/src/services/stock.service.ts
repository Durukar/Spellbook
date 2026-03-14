import { db } from '../db/client'
import type { StockItem, CreateStockItemDto, UpdateStockItemDto } from '../types/stock'

export const stockService = {
  async create(dto: CreateStockItemDto): Promise<StockItem> {
    const result = await db.query<StockItem>(
      `INSERT INTO stock_items (scryfall_id, card_name, set_name, image_url, purchase_price, price_currency, condition, quantity, is_foil)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (scryfall_id, condition, is_foil)
       DO UPDATE SET
         quantity = stock_items.quantity + EXCLUDED.quantity,
         updated_at = NOW()
       RETURNING *`,
      [dto.scryfall_id, dto.card_name, dto.set_name, dto.image_url, dto.purchase_price, dto.price_currency, dto.condition, dto.quantity, dto.is_foil]
    )
    return result.rows[0]
  },

  async findAll(): Promise<StockItem[]> {
    const result = await db.query<StockItem>(
      'SELECT * FROM stock_items ORDER BY created_at DESC'
    )
    return result.rows
  },

  async update(id: string, dto: UpdateStockItemDto): Promise<StockItem | null> {
    const fields: string[] = []
    const values: unknown[] = []
    let idx = 1

    if (dto.quantity !== undefined) { fields.push(`quantity = $${idx++}`); values.push(dto.quantity) }
    if (dto.purchase_price !== undefined) { fields.push(`purchase_price = $${idx++}`); values.push(dto.purchase_price) }
    if (dto.price_currency !== undefined) { fields.push(`price_currency = $${idx++}`); values.push(dto.price_currency) }
    if (dto.condition !== undefined) { fields.push(`condition = $${idx++}`); values.push(dto.condition) }
    if (dto.is_foil !== undefined) { fields.push(`is_foil = $${idx++}`); values.push(dto.is_foil) }

    if (fields.length === 0) return null

    fields.push(`updated_at = NOW()`)
    values.push(id)

    const result = await db.query<StockItem>(
      `UPDATE stock_items SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    )
    return result.rows[0] ?? null
  },

  async delete(id: string): Promise<boolean> {
    const result = await db.query(
      'DELETE FROM stock_items WHERE id = $1',
      [id]
    )
    return (result.rowCount ?? 0) > 0
  },
}
