import { cors } from 'hono/cors'
import type { MiddlewareHandler } from 'hono'
import type { Env } from '../types/env'

export function corsMiddleware(): MiddlewareHandler<{ Bindings: Env }> {
  return async (c, next) => {
    const allowedOrigins = c.env.ALLOWED_ORIGINS
      ? c.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
      : ['http://localhost:5173']

    const origin = c.req.header('origin') ?? ''
    const isAllowed = allowedOrigins.includes(origin)

    return cors({
      origin: isAllowed ? origin : allowedOrigins[0],
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
      maxAge: 86400,
    })(c, next)
  }
}
