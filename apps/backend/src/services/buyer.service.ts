import { db } from '../db/client'
import type { Buyer, CreateBuyerDto, UpdateBuyerDto } from '../types/buyer'

export const buyerService = {
  async create(dto: CreateBuyerDto): Promise<Buyer> {
    const result = await db.query<Buyer>(
      `INSERT INTO buyers (name, phone, instagram, city, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [dto.name, dto.phone, dto.instagram ?? null, dto.city ?? null, dto.notes ?? null]
    )
    return result.rows[0]
  },

  async findAll(): Promise<Buyer[]> {
    const result = await db.query<Buyer>(
      'SELECT * FROM buyers ORDER BY name ASC'
    )
    return result.rows
  },

  async findById(id: string): Promise<Buyer | null> {
    const result = await db.query<Buyer>(
      'SELECT * FROM buyers WHERE id = $1',
      [id]
    )
    return result.rows[0] ?? null
  },

  async update(id: string, dto: UpdateBuyerDto): Promise<Buyer | null> {
    const fields: string[] = []
    const values: unknown[] = []
    let idx = 1

    if (dto.name !== undefined) { fields.push(`name = $${idx++}`); values.push(dto.name) }
    if (dto.phone !== undefined) { fields.push(`phone = $${idx++}`); values.push(dto.phone) }
    if (dto.instagram !== undefined) { fields.push(`instagram = $${idx++}`); values.push(dto.instagram) }
    if (dto.city !== undefined) { fields.push(`city = $${idx++}`); values.push(dto.city) }
    if (dto.notes !== undefined) { fields.push(`notes = $${idx++}`); values.push(dto.notes) }

    if (fields.length === 0) return null

    fields.push(`updated_at = NOW()`)
    values.push(id)

    const result = await db.query<Buyer>(
      `UPDATE buyers SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    )
    return result.rows[0] ?? null
  },

  async delete(id: string): Promise<boolean> {
    const result = await db.query(
      'DELETE FROM buyers WHERE id = $1',
      [id]
    )
    return (result.rowCount ?? 0) > 0
  },
}
