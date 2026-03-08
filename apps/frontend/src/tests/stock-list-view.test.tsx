import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/viewmodels/useStockListViewModel', () => ({
    useStockListViewModel: vi.fn(),
}))

import { StockListView } from '@/components/stock/StockListView'
import { useStockListViewModel } from '@/viewmodels/useStockListViewModel'

const mockItem = {
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
}

describe('StockListView', () => {
    beforeEach(() => vi.clearAllMocks())

    it('exibe indicador de carregamento enquanto busca os dados', () => {
        vi.mocked(useStockListViewModel).mockReturnValue({
            items: [],
            isLoading: true,
            error: null,
        })

        render(<StockListView />)

        expect(screen.getByText(/carregando/i)).toBeDefined()
    })

    it('exibe as cartas do estoque apos carregamento', () => {
        vi.mocked(useStockListViewModel).mockReturnValue({
            items: [mockItem],
            isLoading: false,
            error: null,
        })

        render(<StockListView />)

        expect(screen.getByText('Lightning Bolt')).toBeDefined()
        expect(screen.getByText('Limited Edition Alpha')).toBeDefined()
    })

    it('exibe condicao e quantidade da carta', () => {
        vi.mocked(useStockListViewModel).mockReturnValue({
            items: [mockItem],
            isLoading: false,
            error: null,
        })

        render(<StockListView />)

        expect(screen.getByText('NM')).toBeDefined()
        expect(screen.getByText('1')).toBeDefined()
    })

    it('exibe mensagem quando nao ha cartas cadastradas', () => {
        vi.mocked(useStockListViewModel).mockReturnValue({
            items: [],
            isLoading: false,
            error: null,
        })

        render(<StockListView />)

        expect(screen.queryByText(/nenhuma carta/i)).toBeDefined()
    })

    it('exibe mensagem de erro quando a busca falha', () => {
        vi.mocked(useStockListViewModel).mockReturnValue({
            items: [],
            isLoading: false,
            error: 'Falha ao carregar cartas.',
        })

        render(<StockListView />)

        expect(screen.getByText(/falha ao carregar/i)).toBeDefined()
    })
})
