import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../db/client', () => ({
  db: {
    query: vi.fn(),
  },
}))

import { stockService } from '../services/stock.service'
import { db } from '../db/client'

const mockItem = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  scryfall_id: 'abc123',
  card_name: 'Lightning Bolt',
  set_name: 'Limited Edition Alpha',
  image_url: 'https://example.com/img.jpg',
  purchase_price: 1.5,
  price_currency: 'USD',
  purchase_date: '2026-03-08T00:00:00.000Z',
  condition: 'NM',
  quantity: 1,
  created_at: '2026-03-08T00:00:00.000Z',
}

describe('stockService.create', () => {
  beforeEach(() => vi.clearAllMocks())

  it('insere uma carta no banco e retorna o item criado', async () => {
    vi.mocked(db.query).mockResolvedValueOnce({ rows: [mockItem], rowCount: 1 } as never)

    const result = await stockService.create({
      scryfall_id: 'abc123',
      card_name: 'Lightning Bolt',
      set_name: 'Limited Edition Alpha',
      image_url: 'https://example.com/img.jpg',
      purchase_price: 1.5,
      price_currency: 'USD',
      condition: 'NM',
      quantity: 1,
      is_foil: false,
    })

    expect(result.id).toBe(mockItem.id)
    expect(result.card_name).toBe('Lightning Bolt')
    expect(db.query).toHaveBeenCalledOnce()
  })

  it('passa os parametros corretos para a query SQL', async () => {
    vi.mocked(db.query).mockResolvedValueOnce({ rows: [mockItem], rowCount: 1 } as never)

    const dto = {
      scryfall_id: 'abc123',
      card_name: 'Lightning Bolt',
      set_name: 'Limited Edition Alpha',
      image_url: 'https://example.com/img.jpg',
      purchase_price: 1.5,
      price_currency: 'USD' as const,
      condition: 'NM' as const,
      quantity: 2,
      is_foil: false,
    }

    await stockService.create(dto)

    const call = vi.mocked(db.query).mock.calls[0]
    const params = call[1] as unknown[]
    expect(params[0]).toBe('abc123')
    expect(params[1]).toBe('Lightning Bolt')
    expect(params[5]).toBe('USD')
    expect(params[7]).toBe(2)
  })
})

describe('stockService.findAll', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna todos os itens do estoque ordenados por data', async () => {
    vi.mocked(db.query).mockResolvedValueOnce({ rows: [mockItem], rowCount: 1 } as never)

    const result = await stockService.findAll()

    expect(result).toHaveLength(1)
    expect(result[0].card_name).toBe('Lightning Bolt')
    expect(db.query).toHaveBeenCalledOnce()
  })

  it('retorna lista vazia quando nao ha itens no estoque', async () => {
    vi.mocked(db.query).mockResolvedValueOnce({ rows: [], rowCount: 0 } as never)

    const result = await stockService.findAll()

    expect(result).toHaveLength(0)
  })
})
