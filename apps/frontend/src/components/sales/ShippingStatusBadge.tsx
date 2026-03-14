import type { ShippingStatus } from '@/types/sale'

const SHIPPING_STATUS_LABELS: Record<ShippingStatus, string> = {
    pending_shipment: 'Aguardando Envio',
    shipped: 'Enviado',
    in_transit: 'Em Transito',
    delivered: 'Entregue',
    returned: 'Devolvido',
}

const SHIPPING_STATUS_COLORS: Record<ShippingStatus, string> = {
    pending_shipment: 'text-text-muted bg-bg-muted border-border-subtle',
    shipped: 'text-sky-400 bg-sky-500/10 border-sky-500/25',
    in_transit: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/25',
    delivered: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    returned: 'text-red-400 bg-red-500/10 border-red-500/25',
}

interface ShippingStatusBadgeProps {
    status: ShippingStatus
    className?: string
}

export function ShippingStatusBadge({ status, className = '' }: ShippingStatusBadgeProps) {
    const color = SHIPPING_STATUS_COLORS[status] ?? SHIPPING_STATUS_COLORS.pending_shipment
    return (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${color} ${className}`}>
            {SHIPPING_STATUS_LABELS[status] ?? status}
        </span>
    )
}
