import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { apiService } from '@/services/apiService';

describe('API Service', () => {
    let fetchSpy: any;

    beforeEach(() => {
        fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({
                object: 'list',
                total_cards: 1,
                has_more: false,
                data: [{ id: '123', name: 'Test Card' }],
            }),
        } as Response);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('searchCards appends include_multilingual=true to the backend fetch query', async () => {
        await apiService.searchCards('afundar');

        expect(fetchSpy).toHaveBeenCalledWith(
            expect.stringContaining('q=afundar'),
        );
        expect(fetchSpy).toHaveBeenCalledWith(
            expect.stringContaining('include_multilingual=true'),
        );
    });

    it('searchCards handles pagination correctly', async () => {
        await apiService.searchCards('dragao', 2);

        expect(fetchSpy).toHaveBeenCalledWith(
            expect.stringContaining('page=2'),
        );
    });

    describe('rastreio de envios', () => {
        beforeEach(() => {
            fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
                ok: true,
                json: async () => ({ id: 'sale-001', tracking_code: 'AA123BR' }),
            } as Response)
        })

        it('addTracking faz PATCH para /api/v1/sales/:id/tracking', async () => {
            await apiService.addTracking('sale-001', { tracking_code: 'AA123BR', carrier: 'PAC' })

            expect(fetchSpy).toHaveBeenCalledWith(
                expect.stringContaining('/api/v1/sales/sale-001/tracking'),
                expect.objectContaining({ method: 'PATCH' })
            )
        })

        it('getTracking faz GET para /api/v1/sales/:id/tracking', async () => {
            await apiService.getTracking('sale-001')

            expect(fetchSpy).toHaveBeenCalledWith(
                expect.stringContaining('/api/v1/sales/sale-001/tracking')
            )
        })
    })
});
