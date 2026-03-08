import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { scryfallService } from '@/services/scryfallService';
import type { ScryfallCardList } from '@/types/scryfall';

describe('Scryfall Service', () => {
    beforeEach(() => {
        nock.disableNetConnect();
    });

    afterEach(() => {
        nock.cleanAll();
        nock.enableNetConnect();
    });

    it('searchCards should include include_multilingual=true to allow searching in Portuguese', async () => {
        const mockResponse: ScryfallCardList = {
            object: 'list',
            total_cards: 1,
            has_more: false,
            data: [
                {
                    id: '123',
                    name: 'Lightning Bolt',
                    printed_name: 'Raio',
                    lang: 'pt',
                    object: 'card'
                } as any
            ]
        };

        const scope = nock('https://api.scryfall.com')
            .get('/cards/search')
            .query({ q: 'raio', page: '1', include_multilingual: 'true' })
            .reply(200, mockResponse);

        const result = await scryfallService.searchCards('raio');

        expect(result.data[0].name).toBe('Lightning Bolt');
        expect(scope.isDone()).toBe(true);
    });

    it('searchCards should handle pagination correctly with multilingual parameter', async () => {
        const mockResponse: ScryfallCardList = {
            object: 'list',
            total_cards: 1,
            has_more: false,
            data: []
        };

        const scope = nock('https://api.scryfall.com')
            .get('/cards/search')
            .query({ q: 'dragao', page: '2', include_multilingual: 'true' })
            .reply(200, mockResponse);

        await scryfallService.searchCards('dragao', 2);

        expect(scope.isDone()).toBe(true);
    });
});
