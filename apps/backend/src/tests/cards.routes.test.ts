import { describe, it, expect, vi, beforeEach } from 'vitest'
import app from '../index'

const mockFetch = vi.mocked(fetch)

const mockEnv = {
  ENVIRONMENT: 'development' as const,
  ALLOWED_ORIGINS: 'http://localhost:5173',
}

const mockCard = {
  id: 'abc123',
  name: 'Lightning Bolt',
  set: 'lea',
  set_name: 'Limited Edition Alpha',
  collector_number: '161',
  rarity: 'common',
  prices: { usd: '1.00', usd_foil: null, eur: '0.90' },
}

function mockOkResponse(body: unknown) {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
  } as unknown as Response
}

function mockErrorResponse(status: number) {
  return { ok: false, status } as unknown as Response
}

describe('GET /api/v1/cards/search', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 400 when query param "q" is missing', async () => {
    const res = await app.request('/api/v1/cards/search', {}, mockEnv)

    expect(res.status).toBe(400)
  })

  it('returns error message when "q" is missing', async () => {
    const res = await app.request('/api/v1/cards/search', {}, mockEnv)
    const body = await res.json() as Record<string, string>

    expect(body.error).toContain('"q"')
  })

  it('returns 200 with card results on valid search', async () => {
    const payload = { data: [mockCard], has_more: false, total_cards: 1 }
    mockFetch.mockResolvedValueOnce(mockOkResponse(payload))

    const res = await app.request('/api/v1/cards/search?q=Lightning+Bolt', {}, mockEnv)

    expect(res.status).toBe(200)
    const body = await res.json() as typeof payload
    expect(body.data).toHaveLength(1)
    expect(body.data[0].name).toBe('Lightning Bolt')
  })

  it('returns 502 when Scryfall API fails', async () => {
    mockFetch.mockResolvedValueOnce(mockErrorResponse(500))

    const res = await app.request('/api/v1/cards/search?q=bolt', {}, mockEnv)

    expect(res.status).toBe(502)
  })
})

describe('GET /api/v1/cards/named', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 400 when query param "name" is missing', async () => {
    const res = await app.request('/api/v1/cards/named', {}, mockEnv)

    expect(res.status).toBe(400)
  })

  it('returns 200 with card when name is found', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse(mockCard))

    const res = await app.request('/api/v1/cards/named?name=Lightning+Bolt', {}, mockEnv)

    expect(res.status).toBe(200)
    const body = await res.json() as typeof mockCard
    expect(body.name).toBe('Lightning Bolt')
  })

  it('returns 404 when card name is not found', async () => {
    mockFetch.mockResolvedValueOnce(mockErrorResponse(404))

    const res = await app.request('/api/v1/cards/named?name=Nonexistent', {}, mockEnv)

    expect(res.status).toBe(404)
  })
})

describe('GET /api/v1/cards/:id', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 200 with card when id is found', async () => {
    mockFetch.mockResolvedValueOnce(mockOkResponse(mockCard))

    const res = await app.request('/api/v1/cards/abc123', {}, mockEnv)

    expect(res.status).toBe(200)
    const body = await res.json() as typeof mockCard
    expect(body.id).toBe('abc123')
  })

  it('returns 404 when card id is not found', async () => {
    mockFetch.mockResolvedValueOnce(mockErrorResponse(404))

    const res = await app.request('/api/v1/cards/invalid-id', {}, mockEnv)

    expect(res.status).toBe(404)
  })
})

describe('CORS middleware', () => {
  beforeEach(() => vi.clearAllMocks())

  it('includes Access-Control-Allow-Origin header for allowed origins', async () => {
    const res = await app.request(
      '/health',
      { headers: { origin: 'http://localhost:5173' } },
      mockEnv
    )

    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:5173')
  })

  it('responds to OPTIONS preflight with 204', async () => {
    const res = await app.request(
      '/api/v1/cards/search',
      {
        method: 'OPTIONS',
        headers: {
          origin: 'http://localhost:5173',
          'Access-Control-Request-Method': 'GET',
        },
      },
      mockEnv
    )

    expect(res.status).toBe(204)
  })
})
