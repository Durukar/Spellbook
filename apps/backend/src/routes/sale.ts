import { Hono } from 'hono'
import { saleController } from '../controllers/sale.controller'

export const saleRoutes = new Hono()

saleRoutes.post('/', saleController.create)
saleRoutes.get('/stats', saleController.getStats)
saleRoutes.get('/', saleController.list)
saleRoutes.get('/:id', saleController.getById)
