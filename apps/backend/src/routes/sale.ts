import { Hono } from 'hono'
import { saleController } from '../controllers/sale.controller'

export const saleRoutes = new Hono()

saleRoutes.post('/', saleController.create)
saleRoutes.get('/stats', saleController.getStats)
saleRoutes.get('/', saleController.list)
saleRoutes.patch('/:id/tracking', saleController.addTracking)
saleRoutes.delete('/:id/tracking', saleController.removeTracking)
saleRoutes.get('/:id/tracking', saleController.refreshTracking)
saleRoutes.get('/:id', saleController.getById)
