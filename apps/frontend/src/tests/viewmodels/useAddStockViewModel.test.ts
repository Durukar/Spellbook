import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAddStockViewModel } from '../../viewmodels/useAddStockViewModel';
import { stockService } from '../../services/stockService';
import { scryfallService } from '../../services/scryfallService';
import type { ScryfallCard } from '../../types/scryfall';

describe('useAddStockViewModel', () => {
    const mockCard: ScryfallCard = {
        object: 'card',
        id: 'card-1',
        name: 'Lightning Bolt',
        set: 'lea',
        set_name: 'Alpha',
        collector_number: '1',
        released_at: '1993-08-05',
        lang: 'en',
        rarity: 'common',
        prices: { usd: '15.50', eur: null, usd_foil: null, eur_foil: null },
        image_uris: { normal: 'http://example.com/bolt.jpg', small: '', large: '', art_crop: '', border_crop: '' },
    };

    const mockCard2: ScryfallCard = {
        object: 'card',
        id: 'card-2',
        name: 'Lightning Bolt',
        set: 'leb',
        set_name: 'Beta',
        collector_number: '1',
        released_at: '1993-10-04',
        lang: 'en',
        rarity: 'common',
        prices: { usd: '45.00', eur: null, usd_foil: null, eur_foil: null },
        image_uris: { normal: 'http://example.com/bolt-beta.jpg', small: '', large: '', art_crop: '', border_crop: '' },
    };

    beforeEach(() => {
        // Mock the implementation of the stock service to prevent actual localStorage writes during VM tests
        vi.spyOn(stockService, 'addStockItem').mockImplementation(async (item: any) => {
            return {
                ...item,
                id: 'generated-uuid',
                purchaseDate: '2023-10-27T10:00:00.000Z',
            };
        });

        // Mock Scryfall service format
        vi.spyOn(scryfallService, 'searchCardsExactName').mockImplementation(async () => {
            return { object: 'list', has_more: false, total_cards: 2, data: [mockCard, mockCard2] };
        });
    });

    it('should initialize with default values based on the provided card', () => {
        const { result } = renderHook(() => useAddStockViewModel(mockCard));

        expect(result.current.price).toBe('');
        expect(result.current.condition).toBe('NM');
        expect(result.current.quantity).toBe('1');
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('should initialize with an empty price if the card has no price', () => {
        const cardWithoutPrice = { ...mockCard, prices: { usd: null, eur: null } };
        const { result } = renderHook(() => useAddStockViewModel(cardWithoutPrice));

        expect(result.current.price).toBe('');
    });

    it('should allow updating the form state', () => {
        const { result } = renderHook(() => useAddStockViewModel(mockCard));

        act(() => {
            result.current.setPrice('12.00');
            result.current.setCondition('SP');
            result.current.setQuantity(4);
        });

        expect(result.current.price).toBe('12.00');
        expect(result.current.condition).toBe('SP');
        expect(result.current.quantity).toBe(4);
    });

    it('should fetch printings when initialized with a card', async () => {
        const { result } = renderHook(() => useAddStockViewModel(mockCard));

        await waitFor(() => {
            expect(scryfallService.searchCardsExactName).toHaveBeenCalledWith('Lightning Bolt');
            expect(result.current.printings.length).toBe(2);
        });
    });

    it('should update selected card when a different edition is selected', async () => {
        const { result } = renderHook(() => useAddStockViewModel(mockCard));

        act(() => {
            result.current.setSelectedCard(mockCard2);
        });

        expect(result.current.selectedCard?.set_name).toBe('Beta');
    });

    it('should save the stock item correctly', async () => {
        const { result } = renderHook(() => useAddStockViewModel(mockCard));

        act(() => {
            result.current.setPrice('15.50');
        });

        let successResult = false;

        await act(async () => {
            successResult = await result.current.saveStockItem();
        });

        expect(successResult).toBe(true);
        expect(result.current.isLoading).toBe(false);
        expect(stockService.addStockItem).toHaveBeenCalledWith({
            scryfallId: 'card-1',
            cardName: 'Lightning Bolt',
            setName: 'Alpha',
            imageUrl: 'http://example.com/bolt.jpg',
            purchasePrice: 15.50,
            condition: 'NM',
            quantity: 1,
        });
    });

    it('should handle errors during save', async () => {
        vi.spyOn(stockService, 'addStockItem').mockImplementationOnce(() => {
            throw new Error('Database Error');
        });

        const { result } = renderHook(() => useAddStockViewModel(mockCard));

        let successResult = true;

        await act(async () => {
            successResult = await result.current.saveStockItem();
        });

        expect(successResult).toBe(false);
        expect(result.current.error).toBe('Failed to save card to stock.');
        expect(result.current.isLoading).toBe(false);
    });
});
