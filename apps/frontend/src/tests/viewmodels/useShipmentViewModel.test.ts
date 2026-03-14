import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

vi.mock('@/services/apiService', () => ({
    apiService: {
        addTracking: vi.fn(),
        getTracking: vi.fn(),
    },
}))

import { useShipmentViewModel } from '@/viewmodels/useShipmentViewModel'
import { apiService } from '@/services/apiService'
import type { BackendSale } from '@/types/sale'

const baseSale: BackendSale = {
    id: 'sale-001',
    buyer_id: null,
    buyer_name: null,
    payment_method: 'pix',
    notes: null,
    total_amount: 50,
    discount_amount: 0,
    created_at: '2026-03-10T00:00:00Z',
    updated_at: '2026-03-10T00:00:00Z',
    items: [],
    tracking_code: null,
    carrier: null,
    shipping_status: 'pending_shipment',
    shipment_events: [],
}

describe('useShipmentViewModel', () => {
    beforeEach(() => vi.clearAllMocks())

    it('inicia sem rastreio quando tracking_code e nulo', () => {
        const { result } = renderHook(() => useShipmentViewModel(baseSale, vi.fn()))
        expect(result.current.hasTracking).toBe(false)
    })

    it('detecta rastreio existente quando tracking_code esta preenchido', () => {
        const sale = { ...baseSale, tracking_code: 'AA123BR', carrier: 'Correios' }
        const { result } = renderHook(() => useShipmentViewModel(sale, vi.fn()))
        expect(result.current.hasTracking).toBe(true)
    })

    it('nao exibe alerta de fiado quando status nao e delivered', () => {
        const sale = { ...baseSale, payment_method: 'fiado' as const }
        const { result } = renderHook(() => useShipmentViewModel(sale, vi.fn()))
        expect(result.current.showFiadoAlert).toBe(false)
    })

    it('exibe alerta de fiado quando entregue e pagamento e fiado', () => {
        const sale = {
            ...baseSale,
            payment_method: 'fiado' as const,
            shipping_status: 'delivered' as const,
        }
        const { result } = renderHook(() => useShipmentViewModel(sale, vi.fn()))
        expect(result.current.showFiadoAlert).toBe(true)
    })

    it('nao exibe alerta de fiado quando entregue e pagamento nao e fiado', () => {
        const sale = {
            ...baseSale,
            payment_method: 'pix' as const,
            shipping_status: 'delivered' as const,
        }
        const { result } = renderHook(() => useShipmentViewModel(sale, vi.fn()))
        expect(result.current.showFiadoAlert).toBe(false)
    })

    it('submitTracking retorna false e seta erro quando campos estao vazios', async () => {
        const { result } = renderHook(() => useShipmentViewModel(baseSale, vi.fn()))

        const success = await act(() => result.current.submitTracking())

        expect(success).toBe(false)
        expect(result.current.trackingError).toBeDefined()
        expect(apiService.addTracking).not.toHaveBeenCalled()
    })

    it('submitTracking chama apiService.addTracking com payload correto e chama onUpdate', async () => {
        const updatedSale = { ...baseSale, tracking_code: 'AA123BR', carrier: 'PAC' }
        vi.mocked(apiService.addTracking).mockResolvedValueOnce(updatedSale)

        const onUpdate = vi.fn()
        const { result } = renderHook(() => useShipmentViewModel(baseSale, onUpdate))

        act(() => { result.current.setTrackingCode('AA123BR') })
        act(() => { result.current.setCarrier('PAC') })

        const success = await act(() => result.current.submitTracking())

        expect(success).toBe(true)
        expect(apiService.addTracking).toHaveBeenCalledWith('sale-001', {
            tracking_code: 'AA123BR',
            carrier: 'PAC',
        })
        expect(onUpdate).toHaveBeenCalledWith(updatedSale)
    })

    it('refreshTracking atualiza events e currentStatus apos chamada bem-sucedida', async () => {
        const saleWithEvents = {
            ...baseSale,
            tracking_code: 'AA123BR',
            shipping_status: 'delivered' as const,
            shipment_events: [
                {
                    id: 'evt-001',
                    sale_id: 'sale-001',
                    event_code: 'BDE',
                    description: 'Objeto entregue ao destinatario',
                    location: 'Sao Paulo/SP',
                    occurred_at: '2026-03-18T14:30:00Z',
                    created_at: '2026-03-18T14:30:00Z',
                },
            ],
        }
        vi.mocked(apiService.getTracking).mockResolvedValueOnce(saleWithEvents)

        const saleWithTracking = { ...baseSale, tracking_code: 'AA123BR', carrier: 'PAC' }
        const onUpdate = vi.fn()
        const { result } = renderHook(() => useShipmentViewModel(saleWithTracking, onUpdate))

        await act(() => result.current.refreshTracking())

        await waitFor(() => expect(result.current.events).toHaveLength(1))
        expect(result.current.currentStatus).toBe('delivered')
        expect(onUpdate).toHaveBeenCalledWith(saleWithEvents)
    })

    it('refreshTracking seta trackingError quando API falha', async () => {
        vi.mocked(apiService.getTracking).mockRejectedValueOnce(new Error('Proxy offline'))

        const saleWithTracking = { ...baseSale, tracking_code: 'AA123BR', carrier: 'PAC' }
        const { result } = renderHook(() => useShipmentViewModel(saleWithTracking, vi.fn()))

        await act(() => result.current.refreshTracking())

        expect(result.current.trackingError).toBeDefined()
    })
})
