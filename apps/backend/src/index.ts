import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { corsMiddleware } from './middleware/cors'
import { healthRoutes } from './routes/health'
import { cardRoutes } from './routes/cards'
import { stockRoutes } from './routes/stock'
import { buyerRoutes } from './routes/buyer'
import { saleRoutes } from './routes/sale'
import type { Env } from './types/env'

const app = new Hono<{ Bindings: Env }>()

app.use('*', logger())
app.use('*', corsMiddleware())

app.route('/health', healthRoutes)
app.route('/api/v1/cards', cardRoutes)
app.route('/api/v1/stock', stockRoutes)
app.route('/api/v1/buyers', buyerRoutes)
app.route('/api/v1/sales', saleRoutes)

app.notFound((c) => c.json({ error: 'Not found' }, 404))
app.onError((err, c) => {
  console.error(err)
  return c.json({ error: 'Internal server error' }, 500)
})

export default app
