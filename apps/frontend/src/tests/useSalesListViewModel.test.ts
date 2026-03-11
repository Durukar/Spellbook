import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useSalesListViewModel } from '@/viewmodels/useSalesListViewModel'

vi.mock('@/services/apiService', () => ({
    apiService: {
        listSales: vi.fn(),
    },
}))

import { apiService } from '@/services/apiService'

const mockSale = {
    id: 'sale-001',
    buyer_id: null,
    buyer_name: null,
    payment_method: 'pix' as const,
    notes: null,
    total_amount: 15,
    discount_amount: 0,
    created_at: '2026-03-10T00:00:00Z',
    updated_at: '2026-03-10T00:00:00Z',
    items: [],
}

describe('useSalesListViewModel', () => {
    beforeEach(() => vi.clearAllMocks())

    it('carrega lista de vendas ao montar', async () => {
        vi.mocked(apiService.listSales).mockResolvedValueOnce([mockSale])

        const { result } = renderHook(() => useSalesListViewModel())

        expect(result.current.isLoading).toBe(true)

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.sales).toHaveLength(1)
        expect(result.current.sales[0].id).toBe('sale-001')
    })

    it('retorna lista vazia quando nao ha vendas', async () => {
        vi.mocked(apiService.listSales).mockResolvedValueOnce([])

        const { result } = renderHook(() => useSalesListViewModel())

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.sales).toHaveLength(0)
    })

    it('expoe erro quando API falha', async () => {
        vi.mocked(apiService.listSales).mockRejectedValueOnce(new Error('Network error'))

        const { result } = renderHook(() => useSalesListViewModel())

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.error).toBeDefined()
        expect(result.current.error).not.toBeNull()
    })

    it('refresh recarrega a lista', async () => {
        vi.mocked(apiService.listSales).mockResolvedValue([mockSale])

        const { result } = renderHook(() => useSalesListViewModel())
        await waitFor(() => expect(result.current.isLoading).toBe(false))

        await result.current.refresh()

        expect(apiService.listSales).toHaveBeenCalledTimes(2)
    })
})
