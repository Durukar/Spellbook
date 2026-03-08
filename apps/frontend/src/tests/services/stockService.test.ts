import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { stockService } from '../../services/stockService';
import type { StockItem } from '../../models/Stock';

describe('stockService', () => {
    // Definimos nossa base de teste mockada
    const mockStockItemInput: Omit<StockItem, 'id' | 'purchaseDate'> = {
        scryfallId: '123-abc',
        cardName: 'Lightning Bolt',
        setName: 'Alpha',
        imageUrl: 'http://example.com/bolt.jpg',
        purchasePrice: 15.5,
        condition: 'NM',
        quantity: 1,
    };

    beforeEach(() => {
        // Limpar o localStorage simulado antes de cada teste
        localStorage.clear();
        stockService.clearStock();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('should add a new stock item and generate an id and purchaseDate', async () => {
        const addedItem = await stockService.addStockItem(mockStockItemInput);

        expect(addedItem).toBeDefined();
        expect(addedItem.id).toBeTypeOf('string');
        expect(addedItem.id.length).toBeGreaterThan(0);
        expect(addedItem.purchaseDate).toBeTypeOf('string');

        // As outras propriedades devem permanecer iguais
        expect(addedItem.cardName).toBe(mockStockItemInput.cardName);
        expect(addedItem.purchasePrice).toBe(mockStockItemInput.purchasePrice);
        expect(addedItem.condition).toBe(mockStockItemInput.condition);
    });

    it('should retrieve all stock items from localStorage', async () => {
        // Adicionar 2 itens
        await stockService.addStockItem(mockStockItemInput);
        await stockService.addStockItem({
            ...mockStockItemInput,
            cardName: 'Black Lotus',
            purchasePrice: 50000,
        });

        const items = await stockService.getStockItems();

        expect(items).toBeInstanceOf(Array);
        expect(items.length).toBe(2);

        // Verifica a ordem de insercao (opcional, dependendo de como vamos ordenar)
        expect(items[0].cardName).toBe('Lightning Bolt');
        expect(items[1].cardName).toBe('Black Lotus');
    });

    it('should return an empty array if there is no stock', async () => {
        const items = await stockService.getStockItems();
        expect(items).toBeInstanceOf(Array);
        expect(items.length).toBe(0);
    });
});
