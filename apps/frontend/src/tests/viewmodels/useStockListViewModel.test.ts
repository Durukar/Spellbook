import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

vi.mock('@/services/apiService', () => ({
    apiService: {
        listStockItems: vi.fn(),
    },
}))

import { useStockListViewModel } from '../../viewmodels/useStockListViewModel'
import { apiService } from '@/services/apiService'

const mockItems = [
    {
        id: '550e8400-e29b-41d4-a716-446655440000',
        scryfall_id: 'abc123',
        card_name: 'Lightning Bolt',
        set_name: 'Limited Edition Alpha',
        image_url: 'https://example.com/img.jpg',
        purchase_price: 1.5,
        purchase_date: '2026-03-08T00:00:00.000Z',
        condition: 'NM',
        quantity: 1,
        created_at: '2026-03-08T00:00:00.000Z',
    },
]

describe('useStockListViewModel', () => {
    beforeEach(() => vi.clearAllMocks())

    it('inicia com estado de carregamento ativo', () => {
        vi.mocked(apiService.listStockItems).mockResolvedValue(mockItems as never)

        const { result } = renderHook(() => useStockListViewModel())

        expect(result.current.isLoading).toBe(true)
    })

    it('carrega e expoe as cartas do estoque apos busca bem-sucedida', async () => {
        vi.mocked(apiService.listStockItems).mockResolvedValue(mockItems as never)

        const { result } = renderHook(() => useStockListViewModel())

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.items).toHaveLength(1)
        expect(result.current.items[0].card_name).toBe('Lightning Bolt')
        expect(result.current.error).toBeNull()
    })

    it('define erro quando a API falha e retorna lista vazia', async () => {
        vi.mocked(apiService.listStockItems).mockRejectedValue(new Error('Falha na API'))

        const { result } = renderHook(() => useStockListViewModel())

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.error).not.toBeNull()
        expect(result.current.items).toHaveLength(0)
    })

    it('retorna lista vazia sem erro quando nao ha cartas cadastradas', async () => {
        vi.mocked(apiService.listStockItems).mockResolvedValue([])

        const { result } = renderHook(() => useStockListViewModel())

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.items).toHaveLength(0)
        expect(result.current.error).toBeNull()
    })
})
