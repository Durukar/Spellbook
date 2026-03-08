import type { StockItem } from '../models/Stock'
import { apiService } from './apiService'

class StockService {
    async addStockItem(item: Omit<StockItem, 'id' | 'purchaseDate'>): Promise<StockItem> {
        const backendItem = await apiService.addStockItem({
            scryfall_id: item.scryfallId,
            card_name: item.cardName,
            set_name: item.setName,
            image_url: item.imageUrl,
            purchase_price: item.purchasePrice,
            condition: item.condition,
            quantity: item.quantity,
        })

        return {
            id: backendItem.id,
            scryfallId: backendItem.scryfall_id,
            cardName: backendItem.card_name,
            setName: backendItem.set_name,
            imageUrl: backendItem.image_url,
            purchasePrice: Number(backendItem.purchase_price),
            purchaseDate: backendItem.purchase_date,
            condition: backendItem.condition,
            quantity: backendItem.quantity,
        }
    }

    async getStockItems(): Promise<StockItem[]> {
        const items = await apiService.listStockItems()
        return items.map(item => ({
            id: item.id,
            scryfallId: item.scryfall_id,
            cardName: item.card_name,
            setName: item.set_name,
            imageUrl: item.image_url,
            purchasePrice: Number(item.purchase_price),
            purchaseDate: item.purchase_date,
            condition: item.condition,
            quantity: item.quantity,
        }))
    }

    clearStock(): void {
        // Mantido para compatibilidade com testes legados
    }
}

export const stockService = new StockService()
