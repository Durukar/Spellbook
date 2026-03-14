import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/viewmodels/useCollectionBySetViewModel', () => ({
    useCollectionBySetViewModel: vi.fn(),
}))

vi.mock('@/viewmodels/useCardDetailViewModel', () => ({
    useCardDetailViewModel: vi.fn(),
}))

import { CollectionBySetView } from '@/components/stock/CollectionBySetView'
import { useCollectionBySetViewModel } from '@/viewmodels/useCollectionBySetViewModel'
import { useCardDetailViewModel } from '@/viewmodels/useCardDetailViewModel'

const mockItems = [
    {
        id: '1',
        scryfall_id: 'abc',
        card_name: 'Lightning Bolt',
        set_name: 'Magic 2010',
        image_url: '',
        purchase_price: 10,
        price_currency: 'USD' as const,
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
        price_currency: 'USD' as const,
        purchase_date: '2026-01-01',
        condition: 'SP',
        quantity: 1,
        is_foil: true,
        created_at: '2026-01-01',
    },
]

const mockSets = [
    {
        set_name: 'Magic 2010',
        icon_svg_uri: 'https://svgs.scryfall.io/sets/m10.svg',
        unique_cards: 1,
        total_quantity: 2,
        total_value: 20,
        foil_count: 0,
        items: [mockItems[0]],
    },
    {
        set_name: 'Limited Edition Alpha',
        icon_svg_uri: 'https://svgs.scryfall.io/sets/lea.svg',
        unique_cards: 1,
        total_quantity: 1,
        total_value: 5000,
        foil_count: 1,
        items: [mockItems[1]],
    },
]

const defaultCardDetailMock = {
    selectedItem: null,
    isOpen: false,
    openDetail: vi.fn(),
    closeDetail: vi.fn(),
}

describe('CollectionBySetView', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useCardDetailViewModel).mockReturnValue(defaultCardDetailMock)
    })

    it('exibe indicador de carregamento enquanto busca os dados', () => {
        vi.mocked(useCollectionBySetViewModel).mockReturnValue({
            sets: [],
            isLoading: true,
            error: null,
            selectedSet: null,
            selectSet: vi.fn(),
            clearSelection: vi.fn(),
            refresh: vi.fn(),
        })

        render(<CollectionBySetView />)

        expect(screen.getByText(/carregando/i)).toBeDefined()
    })

    it('exibe o titulo Por Colecao e a quantidade de colecoes', () => {
        vi.mocked(useCollectionBySetViewModel).mockReturnValue({
            sets: mockSets,
            isLoading: false,
            error: null,
            selectedSet: null,
            selectSet: vi.fn(),
            clearSelection: vi.fn(),
            refresh: vi.fn(),
        })

        render(<CollectionBySetView />)

        expect(screen.getByText('Por Colecao')).toBeDefined()
        expect(screen.getByText(/2 colec/i)).toBeDefined()
    })

    it('exibe os cards de colecao com nome de cada set', () => {
        vi.mocked(useCollectionBySetViewModel).mockReturnValue({
            sets: mockSets,
            isLoading: false,
            error: null,
            selectedSet: null,
            selectSet: vi.fn(),
            clearSelection: vi.fn(),
            refresh: vi.fn(),
        })

        render(<CollectionBySetView />)

        expect(screen.getByText('Magic 2010')).toBeDefined()
        expect(screen.getByText('Limited Edition Alpha')).toBeDefined()
    })

    it('chama selectSet ao clicar em uma colecao', () => {
        const selectSet = vi.fn()
        vi.mocked(useCollectionBySetViewModel).mockReturnValue({
            sets: mockSets,
            isLoading: false,
            error: null,
            selectedSet: null,
            selectSet,
            clearSelection: vi.fn(),
            refresh: vi.fn(),
        })

        render(<CollectionBySetView />)

        fireEvent.click(screen.getByText('Magic 2010'))
        expect(selectSet).toHaveBeenCalledWith('Magic 2010')
    })

    it('exibe as cartas da colecao selecionada no drill-down', () => {
        vi.mocked(useCollectionBySetViewModel).mockReturnValue({
            sets: mockSets,
            isLoading: false,
            error: null,
            selectedSet: mockSets[0],
            selectSet: vi.fn(),
            clearSelection: vi.fn(),
            refresh: vi.fn(),
        })

        render(<CollectionBySetView />)

        expect(screen.getAllByText('Lightning Bolt')[0]).toBeDefined()
    })

    it('exibe botao de voltar no drill-down', () => {
        vi.mocked(useCollectionBySetViewModel).mockReturnValue({
            sets: mockSets,
            isLoading: false,
            error: null,
            selectedSet: mockSets[0],
            selectSet: vi.fn(),
            clearSelection: vi.fn(),
            refresh: vi.fn(),
        })

        render(<CollectionBySetView />)

        expect(screen.getByText(/voltar/i)).toBeDefined()
    })

    it('chama clearSelection ao clicar em voltar', () => {
        const clearSelection = vi.fn()
        vi.mocked(useCollectionBySetViewModel).mockReturnValue({
            sets: mockSets,
            isLoading: false,
            error: null,
            selectedSet: mockSets[0],
            selectSet: vi.fn(),
            clearSelection,
            refresh: vi.fn(),
        })

        render(<CollectionBySetView />)

        fireEvent.click(screen.getByText(/voltar/i))
        expect(clearSelection).toHaveBeenCalled()
    })

    it('exibe mensagem de erro quando a busca falha', () => {
        vi.mocked(useCollectionBySetViewModel).mockReturnValue({
            sets: [],
            isLoading: false,
            error: 'Falha ao carregar colecoes.',
            selectedSet: null,
            selectSet: vi.fn(),
            clearSelection: vi.fn(),
            refresh: vi.fn(),
        })

        render(<CollectionBySetView />)

        expect(screen.getByText(/falha ao carregar/i)).toBeDefined()
    })

    it('exibe mensagem quando nao ha colecoes no estoque', () => {
        vi.mocked(useCollectionBySetViewModel).mockReturnValue({
            sets: [],
            isLoading: false,
            error: null,
            selectedSet: null,
            selectSet: vi.fn(),
            clearSelection: vi.fn(),
            refresh: vi.fn(),
        })

        render(<CollectionBySetView />)

        expect(screen.getByText(/nenhuma colecao/i)).toBeDefined()
    })

    it('exibe o nome do set selecionado como titulo no drill-down', () => {
        vi.mocked(useCollectionBySetViewModel).mockReturnValue({
            sets: mockSets,
            isLoading: false,
            error: null,
            selectedSet: mockSets[0],
            selectSet: vi.fn(),
            clearSelection: vi.fn(),
            refresh: vi.fn(),
        })

        render(<CollectionBySetView />)

        expect(screen.getByRole('heading', { name: 'Magic 2010' })).toBeDefined()
    })
})
