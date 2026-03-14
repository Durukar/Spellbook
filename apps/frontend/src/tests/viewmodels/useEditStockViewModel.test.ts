import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

vi.mock('@/services/apiService', () => ({
    apiService: {
        updateStockItem: vi.fn(),
        deleteStockItem: vi.fn(),
    },
}))

import { useEditStockViewModel } from '../../viewmodels/useEditStockViewModel'
import { apiService } from '@/services/apiService'

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
    quantity: 2,
    is_foil: false,
    created_at: '2026-03-08T00:00:00.000Z',
}

describe('useEditStockViewModel', () => {
    beforeEach(() => vi.clearAllMocks())

    it('inicia com isEditing false e sem erros', () => {
        const { result } = renderHook(() => useEditStockViewModel(mockItem))

        expect(result.current.isEditing).toBe(false)
        expect(result.current.isSaving).toBe(false)
        expect(result.current.isDeleting).toBe(false)
        expect(result.current.error).toBeNull()
    })

    it('startEdit popula editForm com valores do item e seta isEditing true', () => {
        const { result } = renderHook(() => useEditStockViewModel(mockItem))

        act(() => result.current.startEdit())

        expect(result.current.isEditing).toBe(true)
        expect(result.current.editForm.quantity).toBe(2)
        expect(result.current.editForm.purchase_price).toBe(1.5)
        expect(result.current.editForm.condition).toBe('NM')
        expect(result.current.editForm.is_foil).toBe(false)
    })

    it('cancelEdit reseta isEditing e form para valores originais', () => {
        const { result } = renderHook(() => useEditStockViewModel(mockItem))

        act(() => result.current.startEdit())
        act(() => result.current.updateField('quantity', 10))
        act(() => result.current.cancelEdit())

        expect(result.current.isEditing).toBe(false)
        expect(result.current.editForm.quantity).toBe(2)
    })

    it('updateField atualiza um campo especifico do editForm', () => {
        const { result } = renderHook(() => useEditStockViewModel(mockItem))

        act(() => result.current.startEdit())
        act(() => result.current.updateField('quantity', 5))
        act(() => result.current.updateField('condition', 'SP' as const))

        expect(result.current.editForm.quantity).toBe(5)
        expect(result.current.editForm.condition).toBe('SP')
    })

    it('saveEdit chama apiService.updateStockItem e dispara callback onSuccess com item atualizado', async () => {
        const updatedItem = { ...mockItem, quantity: 5 }
        vi.mocked(apiService.updateStockItem).mockResolvedValue(updatedItem)

        const onSuccess = vi.fn()
        const { result } = renderHook(() => useEditStockViewModel(mockItem))

        act(() => result.current.startEdit())
        act(() => result.current.updateField('quantity', 5))

        await act(async () => result.current.saveEdit(onSuccess))

        expect(apiService.updateStockItem).toHaveBeenCalledWith(mockItem.id, {
            quantity: 5,
            purchase_price: 1.5,
            condition: 'NM',
            is_foil: false,
        })
        expect(onSuccess).toHaveBeenCalledWith(updatedItem)
        expect(result.current.isEditing).toBe(false)
        expect(result.current.isSaving).toBe(false)
    })

    it('saveEdit define erro e mantem isEditing true quando API falha', async () => {
        vi.mocked(apiService.updateStockItem).mockRejectedValue(new Error('Falha na API'))

        const onSuccess = vi.fn()
        const { result } = renderHook(() => useEditStockViewModel(mockItem))

        act(() => result.current.startEdit())

        await act(async () => result.current.saveEdit(onSuccess))

        expect(result.current.error).not.toBeNull()
        expect(result.current.isEditing).toBe(true)
        expect(result.current.isSaving).toBe(false)
        expect(onSuccess).not.toHaveBeenCalled()
    })

    it('confirmDelete chama apiService.deleteStockItem e dispara callback onSuccess', async () => {
        vi.mocked(apiService.deleteStockItem).mockResolvedValue(undefined)

        const onSuccess = vi.fn()
        const { result } = renderHook(() => useEditStockViewModel(mockItem))

        await act(async () => result.current.confirmDelete(onSuccess))

        await waitFor(() => expect(result.current.isDeleting).toBe(false))

        expect(apiService.deleteStockItem).toHaveBeenCalledWith(mockItem.id)
        expect(onSuccess).toHaveBeenCalled()
    })

    it('confirmDelete define erro quando API falha', async () => {
        vi.mocked(apiService.deleteStockItem).mockRejectedValue(new Error('Falha ao deletar'))

        const onSuccess = vi.fn()
        const { result } = renderHook(() => useEditStockViewModel(mockItem))

        await act(async () => result.current.confirmDelete(onSuccess))

        expect(result.current.error).not.toBeNull()
        expect(result.current.isDeleting).toBe(false)
        expect(onSuccess).not.toHaveBeenCalled()
    })
})

describe('useEditStockViewModel - acquisition_type', () => {
    beforeEach(() => vi.clearAllMocks())

    it('startEdit popula editForm com acquisition_type do item', () => {
        const itemWithType = { ...mockItem, acquisition_type: 'accumulated' as const }
        const { result } = renderHook(() => useEditStockViewModel(itemWithType))

        act(() => result.current.startEdit())

        expect(result.current.editForm.acquisition_type).toBe('accumulated')
    })

    it('item sem acquisition_type inicializa editForm com purchase como padrao', () => {
        const { result } = renderHook(() => useEditStockViewModel(mockItem))

        act(() => result.current.startEdit())

        expect(result.current.editForm.acquisition_type).toBe('purchase')
    })

    it('updateField permite alterar acquisition_type', () => {
        const { result } = renderHook(() => useEditStockViewModel(mockItem))

        act(() => result.current.startEdit())
        act(() => result.current.updateField('acquisition_type', 'gift' as const))

        expect(result.current.editForm.acquisition_type).toBe('gift')
    })

    it('saveEdit envia acquisition_type no payload quando e diferente de purchase', async () => {
        const itemWithType = { ...mockItem, acquisition_type: 'accumulated' as const }
        const updatedItem = { ...itemWithType }
        vi.mocked(apiService.updateStockItem).mockResolvedValue(updatedItem)

        const onSuccess = vi.fn()
        const { result } = renderHook(() => useEditStockViewModel(itemWithType))

        act(() => result.current.startEdit())
        await act(async () => result.current.saveEdit(onSuccess))

        expect(apiService.updateStockItem).toHaveBeenCalledWith(
            mockItem.id,
            expect.objectContaining({ acquisition_type: 'accumulated' })
        )
    })
})
