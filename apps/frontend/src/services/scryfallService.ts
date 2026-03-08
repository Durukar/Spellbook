import type { ScryfallSetList, ScryfallCardList } from '@/types/scryfall';

const BASE_URL = 'https://api.scryfall.com';

export const scryfallService = {
    async getSets(): Promise<ScryfallSetList> {
        const response = await fetch(`${BASE_URL}/sets`);
        if (!response.ok) {
            throw new Error(`Scryfall API error: ${response.status}`);
        }
        return response.json() as Promise<ScryfallSetList>;
    },

    async searchCards(query: string, page = 1): Promise<ScryfallCardList> {
        const params = new URLSearchParams({ q: query, page: String(page) });
        const response = await fetch(`${BASE_URL}/cards/search?${params}`);
        if (!response.ok) {
            throw new Error(`Scryfall API error: ${response.status}`);
        }
        return response.json() as Promise<ScryfallCardList>;
    },
};
