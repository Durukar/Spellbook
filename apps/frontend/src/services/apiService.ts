import type { ScryfallCardList } from '@/types/scryfall';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8787';

async function request<T>(path: string): Promise<T> {
    const res = await fetch(`${API_URL}${path}`);
    if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
    }
    return res.json() as Promise<T>;
}

export const apiService = {
    searchCards(query: string, page = 1): Promise<ScryfallCardList> {
        const params = new URLSearchParams({ q: query, page: String(page), include_multilingual: 'true' });
        return request<ScryfallCardList>(`/api/v1/cards/search?${params}`);
    },

    async autocomplete(query: string): Promise<string[]> {
        const params = new URLSearchParams({ q: query });
        const result = await request<{ data: string[] }>(`/api/v1/cards/autocomplete?${params}`);
        return result.data;
    },
};
