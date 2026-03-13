import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'

vi.mock('@/services/apiService', () => ({
    apiService: {
        listStockItems: vi.fn(),
    },
}))

vi.mock('@/services/scryfallService', () => ({
    scryfallService: {
        getSets: vi.fn(),
    },
}))

import { useCollectionBySetViewModel } from '@/viewmodels/useCollectionBySetViewModel'
import { apiService } from '@/services/apiService'
import { scryfallService } from '@/services/scryfallService'

const mockStockItems = [
    {
        id: '1',
        scryfall_id: 'abc',
        card_name: 'Lightning Bolt',
        set_name: 'Magic 2010',
        image_url: '',
        purchase_price: 10,
        purchase_date: '2026-01-01',
        condition: 'NM',
        quantity: 2,
        is_foil: false,
        created_at: '2026-01-01',
    },
    {
        id: '2',
        scryfall_id: 'def',
        card_name: 'Black Lotus',
        set_name: 'Limited Edition Alpha',
        image_url: '',
        purchase_price: 5000,
        purchase_date: '2026-01-01',
        condition: 'SP',
        quantity: 1,
        is_foil: true,
        created_at: '2026-01-01',
    },
    {
        id: '3',
        scryfall_id: 'ghi',
        card_name: 'Counterspell',
        set_name: 'Magic 2010',
        image_url: '',
        purchase_price: 5,
        purchase_date: '2026-01-01',
        condition: 'NM',
        quantity: 4,
        is_foil: false,
        created_at: '2026-01-01',
    },
]

const mockScryfallSets = {
    object: 'list' as const,
    has_more: false,
    data: [
        {
            object: 'set' as const,
            id: 's1',
            code: 'm10',
            name: 'Magic 2010',
            uri: '',
            scryfall_uri: '',
            search_uri: '',
            released_at: '2009-07-17',
            set_type: 'core',
            card_count: 249,
            digital: false,
            nonfoil_only: false,
            foil_only: false,
            icon_svg_uri: 'https://svgs.scryfall.io/sets/m10.svg',
        },
        {
            object: 'set' as const,
            id: 's2',
            code: 'lea',
            name: 'Limited Edition Alpha',
            uri: '',
            scryfall_uri: '',
            search_uri: '',
            released_at: '1993-08-05',
            set_type: 'core',
            card_count: 295,
            digital: false,
            nonfoil_only: false,
            foil_only: false,
            icon_svg_uri: 'https://svgs.scryfall.io/sets/lea.svg',
        },
    ],
}

describe('useCollectionBySetViewModel', () => {
    beforeEach(() => vi.clearAllMocks())

    it('inicia com estado de carregamento ativo', () => {
        vi.mocked(apiService.listStockItems).mockResolvedValue([] as never)
        vi.mocked(scryfallService.getSets).mockResolvedValue(mockScryfallSets as never)

        const { result } = renderHook(() => useCollectionBySetViewModel())

        expect(result.current.isLoading).toBe(true)
    })

    it('agrupa cartas por colecao apos carregamento', async () => {
        vi.mocked(apiService.listStockItems).mockResolvedValue(mockStockItems as never)
        vi.mocked(scryfallService.getSets).mockResolvedValue(mockScryfallSets as never)

        const { result } = renderHook(() => useCollectionBySetViewModel())
        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.sets).toHaveLength(2)
    })

    it('calcula estatisticas corretas por colecao', async () => {
        vi.mocked(apiService.listStockItems).mockResolvedValue(mockStockItems as never)
        vi.mocked(scryfallService.getSets).mockResolvedValue(mockScryfallSets as never)

        const { result } = renderHook(() => useCollectionBySetViewModel())
        await waitFor(() => expect(result.current.isLoading).toBe(false))

        const alpha = result.current.sets.find(s => s.set_name === 'Limited Edition Alpha')
        expect(alpha).toBeDefined()
        expect(alpha!.unique_cards).toBe(1)
        expect(alpha!.total_quantity).toBe(1)
        expect(alpha!.total_value).toBe(5000)
        expect(alpha!.foil_count).toBe(1)

        const m10 = result.current.sets.find(s => s.set_name === 'Magic 2010')
        expect(m10).toBeDefined()
        expect(m10!.unique_cards).toBe(2)
        expect(m10!.total_quantity).toBe(6)
        expect(m10!.total_value).toBe(40)
        expect(m10!.foil_count).toBe(0)
    })

    it('associa icone SVG da colecao pelo nome', async () => {
        vi.mocked(apiService.listStockItems).mockResolvedValue(mockStockItems as never)
        vi.mocked(scryfallService.getSets).mockResolvedValue(mockScryfallSets as never)

        const { result } = renderHook(() => useCollectionBySetViewModel())
        await waitFor(() => expect(result.current.isLoading).toBe(false))

        const m10 = result.current.sets.find(s => s.set_name === 'Magic 2010')
        expect(m10!.icon_svg_uri).toBe('https://svgs.scryfall.io/sets/m10.svg')
    })

    it('selectSet define a colecao selecionada', async () => {
        vi.mocked(apiService.listStockItems).mockResolvedValue(mockStockItems as never)
        vi.mocked(scryfallService.getSets).mockResolvedValue(mockScryfallSets as never)

        const { result } = renderHook(() => useCollectionBySetViewModel())
        await waitFor(() => expect(result.current.isLoading).toBe(false))

        act(() => result.current.selectSet('Magic 2010'))

        expect(result.current.selectedSet).toBeDefined()
        expect(result.current.selectedSet!.set_name).toBe('Magic 2010')
    })

    it('clearSelection remove a colecao selecionada', async () => {
        vi.mocked(apiService.listStockItems).mockResolvedValue(mockStockItems as never)
        vi.mocked(scryfallService.getSets).mockResolvedValue(mockScryfallSets as never)

        const { result } = renderHook(() => useCollectionBySetViewModel())
        await waitFor(() => expect(result.current.isLoading).toBe(false))

        act(() => result.current.selectSet('Magic 2010'))
        act(() => result.current.clearSelection())

        expect(result.current.selectedSet).toBeNull()
    })

    it('define erro quando a API de stock falha', async () => {
        vi.mocked(apiService.listStockItems).mockRejectedValue(new Error('Falha na API'))
        vi.mocked(scryfallService.getSets).mockResolvedValue(mockScryfallSets as never)

        const { result } = renderHook(() => useCollectionBySetViewModel())
        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.error).not.toBeNull()
        expect(result.current.sets).toHaveLength(0)
    })

    it('retorna lista vazia sem erro quando nao ha cartas no estoque', async () => {
        vi.mocked(apiService.listStockItems).mockResolvedValue([])
        vi.mocked(scryfallService.getSets).mockResolvedValue(mockScryfallSets as never)

        const { result } = renderHook(() => useCollectionBySetViewModel())
        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.sets).toHaveLength(0)
        expect(result.current.error).toBeNull()
    })

    it('refresh recarrega os dados', async () => {
        vi.mocked(apiService.listStockItems).mockResolvedValue([])
        vi.mocked(scryfallService.getSets).mockResolvedValue(mockScryfallSets as never)

        const { result } = renderHook(() => useCollectionBySetViewModel())
        await waitFor(() => expect(result.current.isLoading).toBe(false))

        vi.mocked(apiService.listStockItems).mockResolvedValue(mockStockItems as never)

        await act(async () => result.current.refresh())

        await waitFor(() => expect(result.current.sets).toHaveLength(2))
    })
})
