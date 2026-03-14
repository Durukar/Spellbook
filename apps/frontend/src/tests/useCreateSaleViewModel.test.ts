import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCreateSaleViewModel } from '@/viewmodels/useCreateSaleViewModel'

vi.mock('@/services/apiService', () => ({
    apiService: {
        createSale: vi.fn(),
        listStockItems: vi.fn(),
        listBuyers: vi.fn(),
    },
}))

import { apiService } from '@/services/apiService'

const mockStockItem = {
    id: 'stock-001',
    scryfall_id: 'scryfall-001',
    card_name: 'Lightning Bolt',
    set_name: 'Alpha',
    image_url: 'https://example.com/img.jpg',
    purchase_price: 10,
    price_currency: 'USD' as const,
    purchase_date: '2026-03-10T00:00:00Z',
    condition: 'NM' as const,
    quantity: 3,
    is_foil: false,
    created_at: '2026-03-10T00:00:00Z',
}

const mockBuyer = {
    id: 'buyer-001',
    name: 'Joao Silva',
    phone: '11999999999',
    instagram: null,
    city: null,
    notes: null,
    created_at: '2026-03-10T00:00:00Z',
    updated_at: '2026-03-10T00:00:00Z',
}

describe('useCreateSaleViewModel', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(apiService.listStockItems).mockResolvedValue([mockStockItem])
        vi.mocked(apiService.listBuyers).mockResolvedValue([mockBuyer])
    })

    it('inicializa com estado vazio', () => {
        const { result } = renderHook(() => useCreateSaleViewModel())

        expect(result.current.selectedItems).toHaveLength(0)
        expect(result.current.paymentMethod).toBe('pix')
        expect(result.current.buyerId).toBeNull()
        expect(result.current.hasStopLossViolation).toBe(false)
        expect(result.current.stopLossConfirmed).toBe(false)
    })

    it('adiciona item ao carrinho com sale_price igual ao purchase_price', () => {
        const { result } = renderHook(() => useCreateSaleViewModel())

        act(() => {
            result.current.addItem(mockStockItem)
        })

        expect(result.current.selectedItems).toHaveLength(1)
        expect(result.current.selectedItems[0].sale_price).toBe(10)
    })

    it('nao adiciona item duplicado', () => {
        const { result } = renderHook(() => useCreateSaleViewModel())

        act(() => {
            result.current.addItem(mockStockItem)
            result.current.addItem(mockStockItem)
        })

        expect(result.current.selectedItems).toHaveLength(1)
    })

    it('remove item do carrinho', () => {
        const { result } = renderHook(() => useCreateSaleViewModel())

        act(() => result.current.addItem(mockStockItem))
        act(() => result.current.removeItem('stock-001'))

        expect(result.current.selectedItems).toHaveLength(0)
    })

    it('atualiza sale_price de um item', () => {
        const { result } = renderHook(() => useCreateSaleViewModel())

        act(() => result.current.addItem(mockStockItem))
        act(() => result.current.updateSalePrice('stock-001', 12))

        expect(result.current.selectedItems[0].sale_price).toBe(12)
    })

    it('nao detecta stop loss quando margem e positiva', () => {
        const { result } = renderHook(() => useCreateSaleViewModel())

        act(() => result.current.addItem(mockStockItem))
        act(() => result.current.updateSalePrice('stock-001', 12))

        expect(result.current.hasStopLossViolation).toBe(false)
    })

    it('detecta stop loss quando prejuizo e maior que 15%', () => {
        const { result } = renderHook(() => useCreateSaleViewModel())

        act(() => result.current.addItem(mockStockItem))
        act(() => result.current.updateSalePrice('stock-001', 8))

        expect(result.current.hasStopLossViolation).toBe(true)
        expect(result.current.stopLossItems).toHaveLength(1)
    })

    it('nao detecta stop loss quando prejuizo e menor que 15%', () => {
        const { result } = renderHook(() => useCreateSaleViewModel())

        act(() => result.current.addItem(mockStockItem))
        act(() => result.current.updateSalePrice('stock-001', 9))

        expect(result.current.hasStopLossViolation).toBe(false)
    })

    it('bloqueia submitSale se stop loss nao confirmado', async () => {
        const { result } = renderHook(() => useCreateSaleViewModel())

        act(() => result.current.addItem(mockStockItem))
        act(() => result.current.updateSalePrice('stock-001', 5))

        const success = await act(() => result.current.submitSale())
        expect(success).toBe(false)
        expect(apiService.createSale).not.toHaveBeenCalled()
    })

    it('permite submitSale quando stop loss confirmado pelo usuario', async () => {
        vi.mocked(apiService.createSale).mockResolvedValueOnce({
            id: 'sale-001',
            buyer_id: null,
            buyer_name: null,
            payment_method: 'pix',
            notes: null,
            total_amount: 5,
            discount_amount: 5,
            created_at: '2026-03-10T00:00:00Z',
            updated_at: '2026-03-10T00:00:00Z',
            items: [],
        })

        const { result } = renderHook(() => useCreateSaleViewModel())

        act(() => result.current.addItem(mockStockItem))
        act(() => result.current.updateSalePrice('stock-001', 5))
        act(() => result.current.confirmStopLoss())

        const success = await act(() => result.current.submitSale())
        expect(success).toBe(true)
    })

    it('chama apiService.createSale com payload correto', async () => {
        vi.mocked(apiService.createSale).mockResolvedValueOnce({
            id: 'sale-001',
            buyer_id: null,
            buyer_name: null,
            payment_method: 'pix',
            notes: null,
            total_amount: 10,
            discount_amount: 0,
            created_at: '2026-03-10T00:00:00Z',
            updated_at: '2026-03-10T00:00:00Z',
            items: [],
        })

        const { result } = renderHook(() => useCreateSaleViewModel())

        act(() => result.current.addItem(mockStockItem))

        await act(() => result.current.submitSale())

        expect(apiService.createSale).toHaveBeenCalledWith({
            payment_method: 'pix',
            buyer_id: undefined,
            notes: undefined,
            items: [{ stock_item_id: 'stock-001', quantity: 1, sale_price: 10 }],
        })
    })

    it('reseta o carrinho apos venda bem-sucedida', async () => {
        vi.mocked(apiService.createSale).mockResolvedValueOnce({
            id: 'sale-001',
            buyer_id: null,
            buyer_name: null,
            payment_method: 'pix',
            notes: null,
            total_amount: 10,
            discount_amount: 0,
            created_at: '2026-03-10T00:00:00Z',
            updated_at: '2026-03-10T00:00:00Z',
            items: [],
        })

        const { result } = renderHook(() => useCreateSaleViewModel())
        act(() => result.current.addItem(mockStockItem))

        await act(() => result.current.submitSale())

        expect(result.current.selectedItems).toHaveLength(0)
    })
})

describe('useCreateSaleViewModel - acquisition_type e stop loss', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(apiService.listStockItems).mockResolvedValue([mockStockItem])
        vi.mocked(apiService.listBuyers).mockResolvedValue([mockBuyer])
    })

    it('nao dispara stop loss para carta acumulada (accumulated)', () => {
        const accumulatedItem = { ...mockStockItem, acquisition_type: 'accumulated' as const }
        const { result } = renderHook(() => useCreateSaleViewModel())

        act(() => result.current.addItem(accumulatedItem))
        act(() => result.current.updateSalePrice('stock-001', 0))

        expect(result.current.hasStopLossViolation).toBe(false)
    })

    it('nao dispara stop loss para carta recebida de presente (gift)', () => {
        const giftItem = { ...mockStockItem, acquisition_type: 'gift' as const }
        const { result } = renderHook(() => useCreateSaleViewModel())

        act(() => result.current.addItem(giftItem))
        act(() => result.current.updateSalePrice('stock-001', 0))

        expect(result.current.hasStopLossViolation).toBe(false)
    })

    it('nao dispara stop loss para carta de trade (trade)', () => {
        const tradeItem = { ...mockStockItem, acquisition_type: 'trade' as const }
        const { result } = renderHook(() => useCreateSaleViewModel())

        act(() => result.current.addItem(tradeItem))
        act(() => result.current.updateSalePrice('stock-001', 0))

        expect(result.current.hasStopLossViolation).toBe(false)
    })

    it('dispara stop loss apenas para cartas compradas (purchase) com prejuizo', () => {
        const purchasedItem = { ...mockStockItem, acquisition_type: 'purchase' as const }
        const { result } = renderHook(() => useCreateSaleViewModel())

        act(() => result.current.addItem(purchasedItem))
        act(() => result.current.updateSalePrice('stock-001', 5))

        expect(result.current.hasStopLossViolation).toBe(true)
    })

    it('item sem acquisition_type definido trata como purchase (comportamento legado)', () => {
        const { result } = renderHook(() => useCreateSaleViewModel())

        act(() => result.current.addItem(mockStockItem))
        act(() => result.current.updateSalePrice('stock-001', 5))

        expect(result.current.hasStopLossViolation).toBe(true)
    })
})
