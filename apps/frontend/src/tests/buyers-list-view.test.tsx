import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/viewmodels/useBuyersListViewModel', () => ({
    useBuyersListViewModel: vi.fn(),
}))

import { BuyersListView } from '@/components/buyers/BuyersListView'
import { useBuyersListViewModel } from '@/viewmodels/useBuyersListViewModel'

const mockBuyer = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Joao Silva',
    phone: '11999998888',
    instagram: '@joaosilva',
    city: 'Sao Paulo',
    notes: null,
    created_at: '2026-03-09T00:00:00.000Z',
    updated_at: '2026-03-09T00:00:00.000Z',
}

describe('BuyersListView', () => {
    beforeEach(() => vi.clearAllMocks())

    it('exibe indicador de carregamento enquanto busca os dados', () => {
        vi.mocked(useBuyersListViewModel).mockReturnValue({
            buyers: [],
            isLoading: true,
            error: null,
            refresh: vi.fn(),
        })

        render(<BuyersListView />)

        expect(screen.getByText(/carregando/i)).toBeDefined()
    })

    it('exibe compradores apos carregamento', () => {
        vi.mocked(useBuyersListViewModel).mockReturnValue({
            buyers: [mockBuyer],
            isLoading: false,
            error: null,
            refresh: vi.fn(),
        })

        render(<BuyersListView />)

        expect(screen.getByText('Joao Silva')).toBeDefined()
        expect(screen.getByText('11999998888')).toBeDefined()
    })

    it('exibe cidade do comprador quando disponivel', () => {
        vi.mocked(useBuyersListViewModel).mockReturnValue({
            buyers: [mockBuyer],
            isLoading: false,
            error: null,
            refresh: vi.fn(),
        })

        render(<BuyersListView />)

        expect(screen.getByText('Sao Paulo')).toBeDefined()
    })

    it('exibe mensagem quando nao ha compradores cadastrados', () => {
        vi.mocked(useBuyersListViewModel).mockReturnValue({
            buyers: [],
            isLoading: false,
            error: null,
            refresh: vi.fn(),
        })

        render(<BuyersListView />)

        expect(screen.queryByText(/nenhum comprador/i)).toBeDefined()
    })

    it('exibe mensagem de erro quando a busca falha', () => {
        vi.mocked(useBuyersListViewModel).mockReturnValue({
            buyers: [],
            isLoading: false,
            error: 'Falha ao carregar compradores.',
            refresh: vi.fn(),
        })

        render(<BuyersListView />)

        expect(screen.getByText(/falha ao carregar/i)).toBeDefined()
    })

    it('exibe botao para adicionar novo comprador', () => {
        vi.mocked(useBuyersListViewModel).mockReturnValue({
            buyers: [],
            isLoading: false,
            error: null,
            refresh: vi.fn(),
        })

        render(<BuyersListView />)

        expect(screen.getByRole('button', { name: /novo comprador/i })).toBeDefined()
    })
})
