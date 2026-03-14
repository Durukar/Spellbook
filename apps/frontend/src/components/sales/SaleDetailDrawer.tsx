import { ExternalLink, RefreshCw, Trash2 } from 'lucide-react'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { BackendSale, ShipmentEvent } from '@/types/sale'
import { FoilBadge } from '@/components/stock/FoilOverlay'
import { ShippingStatusBadge } from '@/components/sales/ShippingStatusBadge'
import { useShipmentViewModel } from '@/viewmodels/useShipmentViewModel'

const PAYMENT_LABELS: Record<string, string> = {
    pix: 'PIX',
    dinheiro: 'Dinheiro',
    fiado: 'Fiado',
    cartao: 'Cartao',
    troca: 'Troca',
}

function MarginBadge({ purchasePrice, salePrice }: { purchasePrice: number; salePrice: number }) {
    if (purchasePrice === 0) return null
    const pct = ((salePrice - purchasePrice) / purchasePrice) * 100
    const color =
        pct >= 0 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
        : pct >= -15 ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
        : 'text-red-400 bg-red-500/10 border-red-500/20'
    return (
        <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded border ${color}`}>
            {pct >= 0 ? '+' : ''}{pct.toFixed(0)}%
        </span>
    )
}

const DELIVERED_CODES = ['BDE', 'BDI']
const RETURNED_CODES = ['BDR', 'DEV']
const OUT_FOR_DELIVERY_CODES = ['OEC']

type DotStyle = { dot: string; ring: string }

function eventDotStyle(code: string, isFirst: boolean): DotStyle {
    if (DELIVERED_CODES.includes(code)) return { dot: 'bg-emerald-400', ring: 'ring-emerald-400' }
    if (RETURNED_CODES.includes(code)) return { dot: 'bg-red-400', ring: 'ring-red-400' }
    if (OUT_FOR_DELIVERY_CODES.includes(code)) return { dot: 'bg-sky-400', ring: 'ring-sky-400' }
    if (isFirst) return { dot: 'bg-yellow-400', ring: 'ring-yellow-400' }
    return { dot: 'bg-border-default', ring: '' }
}

function ShipmentEventRow({ event, isFirst, isLast }: { event: ShipmentEvent; isFirst: boolean; isLast: boolean }) {
    const date = new Date(event.occurred_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    })
    const { dot, ring } = eventDotStyle(event.event_code, isFirst)

    return (
        <div className="flex gap-3">
            <div className="flex flex-col items-center shrink-0">
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${dot} ${isFirst ? `ring-2 ring-offset-2 ring-offset-[#0d0d0d] ${ring}` : ''}`} />
                {!isLast && <div className="w-px flex-1 bg-border-subtle mt-1.5" />}
            </div>
            <div className={`min-w-0 ${!isLast ? 'pb-4' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm leading-snug ${isFirst ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
                        {event.description}
                    </p>
                    <span className="text-[10px] font-mono text-text-muted shrink-0 mt-0.5">{event.event_code}</span>
                </div>
                <div className="mt-0.5 space-y-0.5">
                    {event.location && (
                        <p className="text-xs text-text-muted leading-snug">{event.location}</p>
                    )}
                    <span className="text-xs text-text-muted">{date}</span>
                </div>
            </div>
        </div>
    )
}

interface SaleDetailDrawerProps {
    sale: BackendSale
    isOpen: boolean
    onClose: () => void
    onUpdate?: (updated: BackendSale) => void
}

export function SaleDetailDrawer({ sale, isOpen, onClose, onUpdate }: SaleDetailDrawerProps) {
    const vm = useShipmentViewModel(sale, onUpdate ?? (() => {}))

    const date = new Date(sale.created_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })

    const total = Number(sale.total_amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    const discount = Number(sale.discount_amount)

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent
                className="w-full sm:max-w-md p-0 flex flex-col bg-[#0d0d0d] h-full border-l border-border-subtle shadow-2xl overflow-hidden"
                side="right"
            >
                <div className="px-6 py-4 border-b border-border-subtle shrink-0">
                    <SheetHeader className="p-0">
                        <SheetTitle className="text-lg font-bold text-text-primary">
                            Detalhe da Venda
                        </SheetTitle>
                    </SheetHeader>
                    <p className="text-xs text-text-muted mt-1">{date}</p>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-text-muted">Comprador</span>
                            <span className="text-sm font-semibold text-text-primary">
                                {sale.buyer_name ?? '—'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-text-muted">Pagamento</span>
                            <span className="text-sm font-semibold text-text-primary">
                                {PAYMENT_LABELS[sale.payment_method] ?? sale.payment_method}
                            </span>
                        </div>
                        {sale.notes && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-text-muted">Obs</span>
                                <span className="text-sm text-text-secondary text-right max-w-[60%]">{sale.notes}</span>
                            </div>
                        )}
                    </div>

                    <div className="h-px bg-border-subtle" />

                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                            Itens ({sale.items?.length ?? 0})
                        </p>
                        <div className="space-y-2">
                            {sale.items?.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-bg-elevated border border-border-subtle rounded-xl p-3 flex items-center gap-3"
                                >
                                    <div className="w-10 shrink-0 rounded-md overflow-hidden bg-bg-muted" style={{ aspectRatio: '2.5/3.5' }}>
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.card_name} className="w-full h-full object-cover" />
                                        ) : <div className="w-full h-full bg-bg-muted" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <p className="text-sm font-semibold text-text-primary truncate">{item.card_name}</p>
                                            {item.is_foil && <FoilBadge />}
                                        </div>
                                        <p className="text-xs text-text-muted">{item.condition} · Qtd {item.quantity}</p>
                                        <p className="text-xs text-text-muted mt-0.5">
                                            Custo: {Number(item.purchase_price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </p>
                                    </div>

                                    <div className="text-right shrink-0 space-y-1">
                                        <p className="text-sm font-bold text-text-primary">
                                            {Number(item.sale_price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </p>
                                        <MarginBadge purchasePrice={Number(item.purchase_price)} salePrice={Number(item.sale_price)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-border-subtle" />

                    <div className="space-y-2">
                        {discount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-yellow-400">Desconto concedido</span>
                                <span className="text-yellow-400 font-medium">
                                    -{discount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-base font-bold text-text-primary">Total recebido</span>
                            <span className="text-base font-bold text-emerald-400">{total}</span>
                        </div>
                    </div>

                    <div className="h-px bg-border-subtle" />

                    {vm.showFiadoAlert && (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                            <p className="text-sm font-semibold text-yellow-400">Entregue — Cobrar Fiado</p>
                            <p className="text-xs text-yellow-400/80 mt-1">
                                Pedido entregue com pagamento em fiado. Lembre-se de cobrar via PIX.
                            </p>
                        </div>
                    )}

                    <div className="space-y-3">
                        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                            Rastreio de Envio
                        </p>

                        {!vm.hasTracking ? (
                            <div className="space-y-2">
                                <Input
                                    placeholder="Codigo de rastreio (ex: AA123456789BR)"
                                    value={vm.trackingCode}
                                    onChange={(e) => vm.setTrackingCode(e.target.value.toUpperCase())}
                                    className="uppercase font-mono"
                                />
                                <Input
                                    placeholder="Transportadora (ex: Correios PAC)"
                                    value={vm.carrier}
                                    onChange={(e) => vm.setCarrier(e.target.value)}
                                />
                                {vm.trackingError && (
                                    <p className="text-xs text-red-400">{vm.trackingError}</p>
                                )}
                                <Button
                                    size="sm"
                                    onClick={vm.submitTracking}
                                    disabled={vm.isSubmittingTracking}
                                    className="w-full"
                                >
                                    {vm.isSubmittingTracking ? 'Salvando...' : 'Adicionar Rastreio'}
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-text-muted">Codigo</p>
                                        <p className="text-sm font-mono font-semibold text-text-primary">
                                            {sale.tracking_code}
                                        </p>
                                        <p className="text-xs text-text-muted mt-0.5">{sale.carrier}</p>
                                    </div>
                                    <ShippingStatusBadge status={vm.currentStatus} />
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={vm.refreshTracking}
                                        disabled={vm.isRefreshing || vm.isRemoving}
                                        className="flex-1 gap-1.5"
                                    >
                                        <RefreshCw size={13} className={vm.isRefreshing ? 'animate-spin' : ''} />
                                        {vm.isRefreshing ? 'Atualizando...' : 'Atualizar'}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={vm.removeTracking}
                                        disabled={vm.isRemoving || vm.isRefreshing}
                                        className="gap-1.5 border-red-500/30 text-red-400 hover:bg-red-500/10"
                                    >
                                        <Trash2 size={13} />
                                        {vm.isRemoving ? 'Removendo...' : 'Desvincular'}
                                    </Button>
                                </div>

                                {vm.trackingError && (
                                    <p className="text-xs text-red-400">{vm.trackingError}</p>
                                )}

                                {vm.events.length > 0 && (
                                    <div className="space-y-3 pt-1">
                                        <a
                                            href={`https://seurastreio.com.br/objetos/${sale.tracking_code}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition-colors w-fit"
                                        >
                                            <ExternalLink size={11} />
                                            Histórico completo
                                        </a>
                                        <div>
                                            {vm.events.map((event, i) => (
                                                <ShipmentEventRow
                                                    key={event.id}
                                                    event={event}
                                                    isFirst={i === 0}
                                                    isLast={i === vm.events.length - 1}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
