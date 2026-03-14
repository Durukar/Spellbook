import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCardDetailViewModel } from '../../viewmodels/useCardDetailViewModel'

const mockItem = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    scryfall_id: 'abc123',
    card_name: 'Lightning Bolt',
    set_name: 'Limited Edition Alpha',
    image_url: 'https://example.com/img.jpg',
    purchase_price: 1.5,
    price_currency: 'USD' as const,
    purchase_date: '2026-03-08T00:00:00.000Z',
    condition: 'NM' as const,
    quantity: 1,
    created_at: '2026-03-08T00:00:00.000Z',
}

describe('useCardDetailViewModel', () => {
    it('inicia com item selecionado nulo e drawer fechado', () => {
        const { result } = renderHook(() => useCardDetailViewModel())

        expect(result.current.selectedItem).toBeNull()
        expect(result.current.isOpen).toBe(false)
    })

    it('abre o drawer com o item ao chamar openDetail', () => {
        const { result } = renderHook(() => useCardDetailViewModel())

        act(() => result.current.openDetail(mockItem))

        expect(result.current.selectedItem).toEqual(mockItem)
        expect(result.current.isOpen).toBe(true)
    })

    it('fecha o drawer e limpa o item ao chamar closeDetail', () => {
        const { result } = renderHook(() => useCardDetailViewModel())

        act(() => result.current.openDetail(mockItem))
        act(() => result.current.closeDetail())

        expect(result.current.isOpen).toBe(false)
        expect(result.current.selectedItem).toBeNull()
    })

    it('substitui o item selecionado ao abrir um novo item com drawer ja aberto', () => {
        const anotherItem = { ...mockItem, id: 'outro-id', card_name: 'Black Lotus' }
        const { result } = renderHook(() => useCardDetailViewModel())

        act(() => result.current.openDetail(mockItem))
        act(() => result.current.openDetail(anotherItem))

        expect(result.current.selectedItem?.card_name).toBe('Black Lotus')
        expect(result.current.isOpen).toBe(true)
    })
})
