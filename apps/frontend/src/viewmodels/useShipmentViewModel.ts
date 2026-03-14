import { useState } from 'react'
import { apiService } from '@/services/apiService'
import type { BackendSale, ShipmentEvent, ShippingStatus } from '@/types/sale'

export function useShipmentViewModel(sale: BackendSale, onUpdate: (updated: BackendSale) => void) {
    const [trackingCode, setTrackingCode] = useState(sale.tracking_code ?? '')
    const [carrier, setCarrier] = useState(sale.carrier ?? '')
    const [isSubmittingTracking, setIsSubmittingTracking] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [isRemoving, setIsRemoving] = useState(false)
    const [trackingError, setTrackingError] = useState<string | null>(null)
    const [events, setEvents] = useState<ShipmentEvent[]>(sale.shipment_events ?? [])
    const [currentStatus, setCurrentStatus] = useState<ShippingStatus>(
        sale.shipping_status ?? 'pending_shipment'
    )

    const hasTracking = Boolean(sale.tracking_code)

    const showFiadoAlert = currentStatus === 'delivered' && sale.payment_method === 'fiado'

    async function submitTracking(): Promise<boolean> {
        if (!trackingCode.trim() || !carrier.trim()) {
            setTrackingError('Preencha o codigo de rastreio e a transportadora.')
            return false
        }
        setIsSubmittingTracking(true)
        setTrackingError(null)
        try {
            const updated = await apiService.addTracking(sale.id, {
                tracking_code: trackingCode.trim().toUpperCase(),
                carrier: carrier.trim(),
            })
            onUpdate(updated)
            return true
        } catch (err) {
            setTrackingError(err instanceof Error ? err.message : 'Erro ao salvar rastreio.')
            return false
        } finally {
            setIsSubmittingTracking(false)
        }
    }

    async function refreshTracking(): Promise<void> {
        setIsRefreshing(true)
        setTrackingError(null)
        try {
            const updated = await apiService.getTracking(sale.id)
            setEvents(updated.shipment_events ?? [])
            setCurrentStatus(updated.shipping_status ?? 'pending_shipment')
            onUpdate(updated)
        } catch (err) {
            setTrackingError(err instanceof Error ? err.message : 'Erro ao atualizar rastreio.')
        } finally {
            setIsRefreshing(false)
        }
    }

    async function removeTracking(): Promise<void> {
        setIsRemoving(true)
        setTrackingError(null)
        try {
            const updated = await apiService.removeTracking(sale.id)
            setEvents([])
            setCurrentStatus('pending_shipment')
            setTrackingCode('')
            setCarrier('')
            onUpdate(updated)
        } catch (err) {
            setTrackingError(err instanceof Error ? err.message : 'Erro ao remover rastreio.')
        } finally {
            setIsRemoving(false)
        }
    }

    return {
        trackingCode,
        setTrackingCode,
        carrier,
        setCarrier,
        isSubmittingTracking,
        isRefreshing,
        isRemoving,
        trackingError,
        events,
        currentStatus,
        hasTracking,
        showFiadoAlert,
        submitTracking,
        refreshTracking,
        removeTracking,
    }
}
