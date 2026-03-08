import type { ScryfallCardList } from '@/types/scryfall'
import type { BackendStockItem, CreateStockItemPayload } from '@/types/stock'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8787'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = options
        ? await fetch(`${API_URL}${path}`, options)
        : await fetch(`${API_URL}${path}`)
    if (!res.ok) {
        throw new Error(`API error: ${res.status}`)
    }
    return res.json() as Promise<T>
}

export const apiService = {
    searchCards(query: string, page = 1): Promise<ScryfallCardList> {
        const params = new URLSearchParams({ q: query, page: String(page), include_multilingual: 'true' })
        return request<ScryfallCardList>(`/api/v1/cards/search?${params}`)
    },

    async autocomplete(query: string): Promise<string[]> {
        const params = new URLSearchParams({ q: query })
        const result = await request<{ data: string[] }>(`/api/v1/cards/autocomplete?${params}`)
        return result.data
    },

    addStockItem(payload: CreateStockItemPayload): Promise<BackendStockItem> {
        return request<BackendStockItem>('/api/v1/stock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
    },

    listStockItems(): Promise<BackendStockItem[]> {
        return request<BackendStockItem[]>('/api/v1/stock')
    },
}
