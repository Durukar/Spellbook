import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSalesListViewModel } from '@/viewmodels/useSalesListViewModel'
import { CreateSaleSheet } from '@/components/sales/CreateSaleSheet'
import { SaleDetailDrawer } from '@/components/sales/SaleDetailDrawer'
import { ShippingStatusBadge } from '@/components/sales/ShippingStatusBadge'
import type { BackendSale, BackendSaleItem } from '@/types/sale'

const PAYMENT_LABELS: Record<string, string> = {
    pix: 'PIX',
    dinheiro: 'Dinheiro',
    fiado: 'Fiado',
    cartao: 'Cartao',
    troca: 'Troca',
}

const PREVIEW_LIMIT = 3

interface SaleGroup {
    label: string
    dateKey: string
    sales: BackendSale[]
    total: number
}

function groupSalesByDate(sales: BackendSale[]): SaleGroup[] {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const map = new Map<string, BackendSale[]>()

    for (const sale of sales) {
        const key = new Date(sale.created_at).toDateString()
        if (!map.has(key)) map.set(key, [])
        map.get(key)!.push(sale)
    }

    const groups: SaleGroup[] = []

    for (const [key, items] of map.entries()) {
        const d = new Date(key)
        let label: string
        if (d.toDateString() === today.toDateString()) label = 'Hoje'
        else if (d.toDateString() === yesterday.toDateString()) label = 'Ontem'
        else label = d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })

        const total = items.reduce((sum, s) => sum + Number(s.total_amount), 0)
        groups.push({ label, dateKey: key, sales: items, total })
    }

    return groups.sort((a, b) => new Date(b.dateKey).getTime() - new Date(a.dateKey).getTime())
}

function CardPreviewStrip({ items }: { items: BackendSaleItem[] }) {
    const preview = items.slice(0, PREVIEW_LIMIT)
    const remaining = items.length - preview.length

    return (
        <div className="flex items-center shrink-0">
            {preview.map((item, i) => (
                <div
                    key={item.id}
                    className="w-9 h-[50px] rounded overflow-hidden shrink-0"
                    style={{
                        marginLeft: i > 0 ? '-10px' : 0,
                        zIndex: preview.length - i,
                        boxShadow: '0 0 0 2px rgba(0,0,0,0.45)',
                    }}
                    title={item.card_name}
                >
                    {item.image_url ? (
                        <img
                            src={item.image_url}
                            alt={item.card_name}
                            className="w-full h-full object-cover object-top"
                        />
                    ) : (
                        <div className="w-full h-full bg-bg-muted" />
                    )}
                </div>
            ))}
            {remaining > 0 && (
                <div
                    className="w-9 h-[50px] rounded bg-bg-muted flex items-center justify-center shrink-0"
                    style={{ marginLeft: '-10px', zIndex: 0, boxShadow: '0 0 0 2px rgba(0,0,0,0.45)' }}
                >
                    <span className="text-xs font-semibold text-text-muted">+{remaining}</span>
                </div>
            )}
        </div>
    )
}

function SaleRow({ sale, onClick }: { sale: BackendSale; onClick: () => void }) {
    const total = Number(sale.total_amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    const itemCount = sale.items?.length ?? 0
    const showShippingBadge = sale.shipping_status && sale.shipping_status !== 'pending_shipment'
    const hasItems = itemCount > 0

    const previewNames = sale.items?.slice(0, PREVIEW_LIMIT) ?? []
    const namesOverflow = itemCount - previewNames.length
    const cardNamesText = previewNames
        .map((i) => (i.quantity > 1 ? `${i.quantity}x ${i.card_name}` : i.card_name))
        .join('  ·  ')
    const cardNamesDisplay = namesOverflow > 0 ? `${cardNamesText}  ·  +${namesOverflow} mais` : cardNamesText

    return (
        <div
            className="flex items-center gap-4 px-3 py-2.5 rounded-lg hover:bg-bg-muted/50 transition-colors cursor-pointer"
            onClick={onClick}
        >
            {hasItems ? (
                <CardPreviewStrip items={sale.items!} />
            ) : (
                <div className="w-9 h-[50px] rounded bg-bg-muted flex items-center justify-center shrink-0">
                    <ShoppingCart size={13} className="text-text-muted" />
                </div>
            )}

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary leading-snug">
                    {sale.buyer_name ?? (
                        <span className="text-text-muted font-normal italic">Sem comprador</span>
                    )}
                </p>
                {hasItems && (
                    <p className="text-xs text-text-muted mt-0.5 truncate">{cardNamesDisplay}</p>
                )}
                {showShippingBadge && (
                    <div className="mt-1">
                        <ShippingStatusBadge status={sale.shipping_status!} />
                    </div>
                )}
            </div>

            <div className="flex flex-col items-end gap-0.5 shrink-0">
                <span className="text-sm font-bold text-emerald-400">{total}</span>
                <span className="text-xs text-text-muted">
                    {PAYMENT_LABELS[sale.payment_method] ?? sale.payment_method}
                </span>
            </div>
        </div>
    )
}

export function SalesListView() {
    const { sales, isLoading, error, refresh } = useSalesListViewModel()
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [selectedSale, setSelectedSale] = useState<BackendSale | null>(null)

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full text-text-muted">
                Carregando...
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full text-red-400">
                Falha ao carregar vendas. Verifique a conexao com o servidor.
            </div>
        )
    }

    const groups = groupSalesByDate(sales)

    const totalMes = sales
        .filter((s) => {
            const d = new Date(s.created_at)
            const now = new Date()
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        })
        .reduce((acc, s) => acc + Number(s.total_amount), 0)

    return (
        <>
            <div className="flex flex-col h-full overflow-hidden">
                <div className="px-6 py-5 border-b border-border-subtle shrink-0 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">Vendas</h1>
                        <div className="flex items-center gap-3 mt-1">
                            <p className="text-sm text-text-muted">
                                {sales.length} {sales.length === 1 ? 'venda registrada' : 'vendas registradas'}
                            </p>
                            {totalMes > 0 && (
                                <>
                                    <span className="text-text-muted">·</span>
                                    <p className="text-sm text-emerald-400 font-medium">
                                        {totalMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} este mes
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    <Button size="sm" onClick={() => setIsCreateOpen(true)} className="gap-1.5">
                        <ShoppingCart size={14} />
                        Registrar Venda
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-5">
                    {sales.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-text-muted">
                            <ShoppingCart size={40} className="opacity-20" />
                            <p className="text-lg">Nenhuma venda registrada ainda.</p>
                            <p className="text-sm">Clique em "Registrar Venda" para comecar.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {groups.map((group, gi) => (
                                <motion.div
                                    key={group.dateKey}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2, delay: gi * 0.06 }}
                                >
                                    <div className="flex items-center gap-3 px-3 mb-3">
                                        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider shrink-0">
                                            {group.label}
                                        </span>
                                        <div className="flex-1 h-px bg-border-subtle" />
                                        <span className="text-xs text-text-muted shrink-0">
                                            {group.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </span>
                                    </div>

                                    <div className="flex flex-col">
                                        {group.sales.map((sale) => (
                                            <SaleRow
                                                key={sale.id}
                                                sale={sale}
                                                onClick={() => setSelectedSale(sale)}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <CreateSaleSheet
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={() => refresh()}
            />

            {selectedSale && (
                <SaleDetailDrawer
                    sale={selectedSale}
                    isOpen={!!selectedSale}
                    onClose={() => setSelectedSale(null)}
                    onUpdate={(updated) => {
                        setSelectedSale(updated)
                        refresh()
                    }}
                />
            )}
        </>
    )
}
