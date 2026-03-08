import { v4 as uuidv4 } from 'uuid';
import type { StockItem } from '../models/Stock';

const STOCK_STORAGE_KEY = 'spellbook_stock';

class StockService {
    /**
     * Recupera todos os itens do estoque salvos no localStorage.
     */
    async getStockItems(): Promise<StockItem[]> {
        return new Promise((resolve) => {
            const data = localStorage.getItem(STOCK_STORAGE_KEY);
            if (!data) {
                resolve([]);
                return;
            }

            try {
                const items: StockItem[] = JSON.parse(data);
                resolve(items);
            } catch (error) {
                console.error('Failed to parse stock items from localStorage:', error);
                resolve([]);
            }
        });
    }

    /**
     * Adiciona um novo item ao estoque. Gera o ID (UUID) e a data de aquisição automaticamente.
     */
    async addStockItem(item: Omit<StockItem, 'id' | 'purchaseDate'>): Promise<StockItem> {
        const currentItems = await this.getStockItems();

        const newItem: StockItem = {
            ...item,
            id: uuidv4(),
            purchaseDate: new Date().toISOString(),
        };

        const updatedItems = [...currentItems, newItem];
        localStorage.setItem(STOCK_STORAGE_KEY, JSON.stringify(updatedItems));

        return newItem;
    }

    /**
     * Limpa todo o estoque (Utilidade para os testes TDD ou reset do app).
     */
    clearStock(): void {
        localStorage.removeItem(STOCK_STORAGE_KEY);
    }
}

export const stockService = new StockService();
