import { describe, it, expect, vi, beforeEach } from 'vitest'
import app from '../index'

const mockFetch = vi.mocked(fetch)

const mockEnv = {
  ENVIRONMENT: 'development' as const,
  ALLOWED_ORIGINS: 'http://localhost:5173',
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

describe('GET /api/v1/cards/autocomplete', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 400 quando o parametro "q" esta ausente', async () => {
    const res = await app.request('/api/v1/cards/autocomplete', {}, mockEnv)
    expect(res.status).toBe(400)
  })

  it('retorna mensagem de erro quando "q" esta ausente', async () => {
    const res = await app.request('/api/v1/cards/autocomplete', {}, mockEnv)
    const body = await res.json() as Record<string, string>
    expect(body.error).toContain('"q"')
  })

  it('retorna 200 com array de nomes quando query e valida', async () => {
    const names = ['Lightning Bolt', 'Lightning Strike', 'Lightning Helix']
    mockFetch.mockResolvedValueOnce(
      mockOkResponse({ object: 'catalog', total_values: 3, data: names }),
    )

    const res = await app.request('/api/v1/cards/autocomplete?q=light', {}, mockEnv)

    expect(res.status).toBe(200)
    const body = await res.json() as { data: string[] }
    expect(body.data).toEqual(names)
  })

  it('retorna array vazio quando nao ha sugestoes', async () => {
    mockFetch.mockResolvedValueOnce(
      mockOkResponse({ object: 'catalog', total_values: 0, data: [] }),
    )

    const res = await app.request('/api/v1/cards/autocomplete?q=zzzzz', {}, mockEnv)

    expect(res.status).toBe(200)
    const body = await res.json() as { data: string[] }
    expect(body.data).toEqual([])
  })

  it('retorna 502 quando o Scryfall falha', async () => {
    mockFetch.mockResolvedValueOnce(mockErrorResponse(500))

    const res = await app.request('/api/v1/cards/autocomplete?q=light', {}, mockEnv)

    expect(res.status).toBe(502)
  })
})
