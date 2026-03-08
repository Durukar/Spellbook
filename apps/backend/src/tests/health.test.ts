import { describe, it, expect } from 'vitest'
import app from '../index'

const mockEnv = {
  ENVIRONMENT: 'development' as const,
  ALLOWED_ORIGINS: 'http://localhost:5173',
}

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await app.request('/health', {}, mockEnv)

    expect(res.status).toBe(200)
  })

  it('returns JSON with status "ok"', async () => {
    const res = await app.request('/health', {}, mockEnv)
    const body = await res.json() as Record<string, string>

    expect(body.status).toBe('ok')
  })

  it('returns the service name "spellbook-api"', async () => {
    const res = await app.request('/health', {}, mockEnv)
    const body = await res.json() as Record<string, string>

    expect(body.service).toBe('spellbook-api')
  })

  it('returns the current environment', async () => {
    const res = await app.request('/health', {}, mockEnv)
    const body = await res.json() as Record<string, string>

    expect(body.environment).toBe('development')
  })

  it('returns an ISO timestamp', async () => {
    const res = await app.request('/health', {}, mockEnv)
    const body = await res.json() as Record<string, string>

    expect(() => new Date(body.timestamp)).not.toThrow()
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp)
  })
})

describe('404 handler', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await app.request('/unknown-route', {}, mockEnv)

    expect(res.status).toBe(404)
  })

  it('returns JSON error for unknown routes', async () => {
    const res = await app.request('/unknown-route', {}, mockEnv)
    const body = await res.json() as Record<string, string>

    expect(body.error).toBe('Not found')
  })
})
