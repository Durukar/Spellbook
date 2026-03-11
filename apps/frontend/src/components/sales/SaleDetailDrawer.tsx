import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import type { BackendSale } from '@/types/sale'
import { FoilBadge } from '@/components/stock/FoilOverlay'

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

interface SaleDetailDrawerProps {
    sale: BackendSale
    isOpen: boolean
    onClose: () => void
}

export function SaleDetailDrawer({ sale, isOpen, onClose }: SaleDetailDrawerProps) {
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
                </div>
            </SheetContent>
        </Sheet>
    )
}
