import type {
    ScryfallSetList,
    ScryfallSet,
    ScryfallCardList,
    ScryfallCardDetail,
    ScryfallAutocompleteResult,
} from '@/types/scryfall';

const BASE_URL = 'https://api.scryfall.com';

async function request<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Scryfall API error: ${response.status}`);
    }
    return response.json() as Promise<T>;
}

export const scryfallService = {
    getSets(): Promise<ScryfallSetList> {
        return request<ScryfallSetList>(`${BASE_URL}/sets`);
    },

    getSetByCode(code: string): Promise<ScryfallSet> {
        return request<ScryfallSet>(`${BASE_URL}/sets/${code}`);
    },

    searchCards(query: string, page = 1): Promise<ScryfallCardList> {
        const params = new URLSearchParams({ q: query, page: String(page), include_multilingual: 'true' });
        return request<ScryfallCardList>(`${BASE_URL}/cards/search?${params}`);
    },

    getSetCards(setCode: string, page = 1): Promise<ScryfallCardList> {
        const params = new URLSearchParams({ q: `e:${setCode}`, page: String(page) });
        return request<ScryfallCardList>(`${BASE_URL}/cards/search?${params}`);
    },

    searchCardsExactName(exactName: string): Promise<ScryfallCardList> {
        // use !"name" for exact match, unique=prints gets all printings
        const params = new URLSearchParams({ q: `!"${exactName}"`, unique: 'prints' });
        return request<ScryfallCardList>(`${BASE_URL}/cards/search?${params}`);
    },

    getCardById(id: string): Promise<ScryfallCardDetail> {
        return request<ScryfallCardDetail>(`${BASE_URL}/cards/${id}`);
    },

    getCardByName(name: string, fuzzy = false): Promise<ScryfallCardDetail> {
        const param = fuzzy ? 'fuzzy' : 'exact';
        const params = new URLSearchParams({ [param]: name });
        return request<ScryfallCardDetail>(`${BASE_URL}/cards/named?${params}`);
    },

    async autocomplete(query: string): Promise<string[]> {
        const params = new URLSearchParams({ q: query });
        const result = await request<ScryfallAutocompleteResult>(
            `${BASE_URL}/cards/autocomplete?${params}`,
        );
        return result.data;
    },
};
