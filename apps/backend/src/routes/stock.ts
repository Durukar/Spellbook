import { Hono } from 'hono'
import { stockController } from '../controllers/stock.controller'

export const stockRoutes = new Hono()

stockRoutes.post('/', stockController.create)
stockRoutes.get('/', stockController.findAll)
