import { Hono } from 'hono'
import { cardsController } from '../controllers/cards.controller'
import type { Env } from '../types/env'

export const cardRoutes = new Hono<{ Bindings: Env }>()

cardRoutes.get('/search', cardsController.search)
cardRoutes.get('/named', cardsController.getByName)
cardRoutes.get('/autocomplete', cardsController.autocomplete)
cardRoutes.get('/:id', cardsController.getById)
