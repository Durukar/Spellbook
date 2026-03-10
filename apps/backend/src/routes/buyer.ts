import { Hono } from 'hono'
import { buyerController } from '../controllers/buyer.controller'

export const buyerRoutes = new Hono()

buyerRoutes.post('/', buyerController.create)
buyerRoutes.get('/', buyerController.findAll)
buyerRoutes.patch('/:id', buyerController.update)
buyerRoutes.delete('/:id', buyerController.delete)
