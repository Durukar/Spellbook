import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../services/stock.service', () => ({
  stockService: {
    create: vi.fn(),
    findAll: vi.fn(),
  },
}))

import app from '../index'
import { stockService } from '../services/stock.service'

const mockEnv = {
  ENVIRONMENT: 'development' as const,
  ALLOWED_ORIGINS: 'http://localhost:5173',
}

const mockStockItem = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  scryfall_id: 'abc123',
  card_name: 'Lightning Bolt',
  set_name: 'Limited Edition Alpha',
  image_url: 'https://example.com/img.jpg',
  purchase_price: 1.5,
  purchase_date: '2026-03-08T00:00:00.000Z',
  condition: 'NM',
  quantity: 1,
  created_at: '2026-03-08T00:00:00.000Z',
}

describe('POST /api/v1/stock', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 201 com a carta cadastrada ao enviar dados validos', async () => {
    vi.mocked(stockService.create).mockResolvedValueOnce(mockStockItem as never)

    const res = await app.request(
      '/api/v1/stock',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scryfall_id: 'abc123',
          card_name: 'Lightning Bolt',
          set_name: 'Limited Edition Alpha',
          image_url: 'https://example.com/img.jpg',
          purchase_price: 1.5,
          condition: 'NM',
          quantity: 1,
        }),
      },
      mockEnv
    )

    expect(res.status).toBe(201)
    const body = await res.json() as typeof mockStockItem
    expect(body.card_name).toBe('Lightning Bolt')
    expect(body.id).toBe(mockStockItem.id)
  })

  it('retorna 400 quando dados obrigatorios estao ausentes', async () => {
    const res = await app.request(
      '/api/v1/stock',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_name: 'Lightning Bolt' }),
      },
      mockEnv
    )

    expect(res.status).toBe(400)
    const body = await res.json() as { error: string }
    expect(body.error).toBeDefined()
  })

  it('chama stockService.create com os dados corretos', async () => {
    vi.mocked(stockService.create).mockResolvedValueOnce(mockStockItem as never)

    const payload = {
      scryfall_id: 'abc123',
      card_name: 'Lightning Bolt',
      set_name: 'Limited Edition Alpha',
      image_url: 'https://example.com/img.jpg',
      purchase_price: 1.5,
      condition: 'NM',
      quantity: 1,
    }

    await app.request(
      '/api/v1/stock',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      mockEnv
    )

    expect(stockService.create).toHaveBeenCalledOnce()
  })
})

describe('GET /api/v1/stock', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 200 com lista de cartas do estoque', async () => {
    vi.mocked(stockService.findAll).mockResolvedValueOnce([mockStockItem] as never)

    const res = await app.request('/api/v1/stock', {}, mockEnv)

    expect(res.status).toBe(200)
    const body = await res.json() as typeof mockStockItem[]
    expect(Array.isArray(body)).toBe(true)
    expect(body).toHaveLength(1)
  })

  it('retorna lista vazia quando nao ha cartas cadastradas', async () => {
    vi.mocked(stockService.findAll).mockResolvedValueOnce([])

    const res = await app.request('/api/v1/stock', {}, mockEnv)

    expect(res.status).toBe(200)
    const body = await res.json() as unknown[]
    expect(body).toHaveLength(0)
  })
})
