import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../services/sale.service', () => ({
  saleService: {
    create: vi.fn(),
    findAll: vi.fn(),
    findById: vi.fn(),
    getStats: vi.fn(),
  },
}))

import app from '../index'
import { saleService } from '../services/sale.service'

const mockEnv = {
  ENVIRONMENT: 'development' as const,
  ALLOWED_ORIGINS: 'http://localhost:5173',
}

const mockSaleItem = {
  id: 'item-uuid-001',
  sale_id: 'sale-uuid-001',
  stock_item_id: 'stock-uuid-001',
  card_name: 'Lightning Bolt',
  set_name: 'Limited Edition Alpha',
  image_url: 'https://example.com/img.jpg',
  condition: 'NM',
  is_foil: false,
  quantity: 1,
  purchase_price: 10,
  sale_price: 15,
  created_at: '2026-03-10T00:00:00.000Z',
}

const mockSale = {
  id: 'sale-uuid-001',
  buyer_id: null,
  buyer_name: null,
  payment_method: 'pix',
  notes: null,
  total_amount: 15,
  discount_amount: 0,
  created_at: '2026-03-10T00:00:00.000Z',
  updated_at: '2026-03-10T00:00:00.000Z',
  items: [mockSaleItem],
}

const mockStats = {
  total_revenue: 150,
  total_cost: 100,
  total_profit: 50,
  total_discount: 5,
  sales_count: 3,
  stock_value: 500,
  monthly_revenue: 50,
  monthly_profit: 20,
  monthly_discount: 2,
  monthly_count: 1,
}

describe('POST /api/v1/sales', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 201 com a venda criada ao enviar dados validos', async () => {
    vi.mocked(saleService.create).mockResolvedValueOnce(mockSale as never)

    const res = await app.request(
      '/api/v1/sales',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_method: 'pix',
          items: [{ stock_item_id: 'stock-uuid-001', quantity: 1, sale_price: 15 }],
        }),
      },
      mockEnv
    )

    expect(res.status).toBe(201)
    const body = await res.json() as typeof mockSale
    expect(body.id).toBe(mockSale.id)
    expect(body.payment_method).toBe('pix')
  })

  it('retorna 400 quando items esta vazio', async () => {
    const res = await app.request(
      '/api/v1/sales',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_method: 'pix', items: [] }),
      },
      mockEnv
    )

    expect(res.status).toBe(400)
    const body = await res.json() as { error: string }
    expect(body.error).toBeDefined()
  })

  it('retorna 400 quando payment_method e invalido', async () => {
    const res = await app.request(
      '/api/v1/sales',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_method: 'bitcoin',
          items: [{ stock_item_id: 'stock-uuid-001', quantity: 1, sale_price: 15 }],
        }),
      },
      mockEnv
    )

    expect(res.status).toBe(400)
  })

  it('retorna 422 quando service lanca erro de negocio', async () => {
    vi.mocked(saleService.create).mockRejectedValueOnce(new Error('Quantidade insuficiente'))

    const res = await app.request(
      '/api/v1/sales',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_method: 'dinheiro',
          items: [{ stock_item_id: 'stock-uuid-001', quantity: 99, sale_price: 5 }],
        }),
      },
      mockEnv
    )

    expect(res.status).toBe(422)
    const body = await res.json() as { error: string }
    expect(body.error).toBe('Quantidade insuficiente')
  })
})

describe('GET /api/v1/sales', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 200 com lista de vendas', async () => {
    vi.mocked(saleService.findAll).mockResolvedValueOnce([mockSale] as never)

    const res = await app.request('/api/v1/sales', {}, mockEnv)

    expect(res.status).toBe(200)
    const body = await res.json() as typeof mockSale[]
    expect(Array.isArray(body)).toBe(true)
    expect(body).toHaveLength(1)
  })

  it('retorna lista vazia quando nao ha vendas', async () => {
    vi.mocked(saleService.findAll).mockResolvedValueOnce([])

    const res = await app.request('/api/v1/sales', {}, mockEnv)

    expect(res.status).toBe(200)
    const body = await res.json() as unknown[]
    expect(body).toHaveLength(0)
  })
})

describe('GET /api/v1/sales/stats', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 200 com metricas financeiras', async () => {
    vi.mocked(saleService.getStats).mockResolvedValueOnce(mockStats as never)

    const res = await app.request('/api/v1/sales/stats', {}, mockEnv)

    expect(res.status).toBe(200)
    const body = await res.json() as typeof mockStats
    expect(body.total_revenue).toBeDefined()
    expect(body.stock_value).toBeDefined()
    expect(body.monthly_profit).toBeDefined()
  })
})

describe('GET /api/v1/sales/:id', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 200 com venda pelo id', async () => {
    vi.mocked(saleService.findById).mockResolvedValueOnce(mockSale as never)

    const res = await app.request('/api/v1/sales/sale-uuid-001', {}, mockEnv)

    expect(res.status).toBe(200)
    const body = await res.json() as typeof mockSale
    expect(body.id).toBe(mockSale.id)
  })

  it('retorna 404 quando venda nao existe', async () => {
    vi.mocked(saleService.findById).mockResolvedValueOnce(null)

    const res = await app.request('/api/v1/sales/nao-existe', {}, mockEnv)

    expect(res.status).toBe(404)
  })
})
