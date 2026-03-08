import { Hono } from 'hono'
import type { Env } from '../types/env'

export const healthRoutes = new Hono<{ Bindings: Env }>()

healthRoutes.get('/', (c) => {
  return c.json({
    status: 'ok',
    service: 'spellbook-api',
    environment: c.env.ENVIRONMENT ?? 'development',
    timestamp: new Date().toISOString(),
  })
})
