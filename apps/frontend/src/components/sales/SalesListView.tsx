import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSalesListViewModel } from '@/viewmodels/useSalesListViewModel'
import { CreateSaleSheet } from '@/components/sales/CreateSaleSheet'
import { SaleDetailDrawer } from '@/components/sales/SaleDetailDrawer'
import type { BackendSale } from '@/types/sale'

const PAYMENT_LABELS: Record<string, string> = {
    pix: 'PIX',
    dinheiro: 'Dinheiro',
    fiado: 'Fiado',
    cartao: 'Cartao',
    troca: 'Troca',
}

const PAYMENT_COLORS: Record<string, string> = {
    pix: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    dinheiro: 'text-sky-400 bg-sky-500/10 border-sky-500/25',
    fiado: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/25',
    cartao: 'text-purple-400 bg-purple-500/10 border-purple-500/25',
    troca: 'text-orange-400 bg-orange-500/10 border-orange-500/25',
}

function SaleRow({ sale, index, onClick }: { sale: BackendSale; index: number; onClick: () => void }) {
    const date = new Date(sale.created_at).toLocaleDateString('pt-BR')
    const total = Number(sale.total_amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    const itemCount = sale.items?.length ?? 0
    const paymentColor = PAYMENT_COLORS[sale.payment_method] ?? 'text-text-muted bg-bg-muted border-border-subtle'

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, delay: index * 0.03 }}
            className="bg-bg-elevated border border-border-subtle rounded-xl flex items-center gap-4 px-4 py-3 hover:border-border-default transition-colors cursor-pointer"
            onClick={onClick}
        >
            <div className="w-10 h-10 rounded-full bg-bg-muted border border-border-subtle flex items-center justify-center shrink-0">
                <ShoppingCart size={16} className="text-text-muted" />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="font-semibold text-text-primary truncate">
                        {sale.buyer_name ?? (
                            <span className="text-text-muted italic">Sem comprador</span>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-text-muted">{date}</span>
                    <span className="text-xs text-text-muted">·</span>
                    <span className="text-xs text-text-muted">
                        {itemCount} {itemCount === 1 ? 'item' : 'itens'}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${paymentColor}`}>
                    {PAYMENT_LABELS[sale.payment_method] ?? sale.payment_method}
                </span>
                <span className="text-sm font-bold text-emerald-400">{total}</span>
            </div>
        </motion.div>
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

                    <Button
                        size="sm"
                        onClick={() => setIsCreateOpen(true)}
                        className="gap-1.5"
                    >
                        <ShoppingCart size={14} />
                        Registrar Venda
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {sales.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-text-muted">
                            <ShoppingCart size={40} className="opacity-20" />
                            <p className="text-lg">Nenhuma venda registrada ainda.</p>
                            <p className="text-sm">
                                Clique em "Registrar Venda" para comecar.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {sales.map((sale, index) => (
                                <SaleRow
                                    key={sale.id}
                                    sale={sale}
                                    index={index}
                                    onClick={() => setSelectedSale(sale)}
                                />
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
                />
            )}
        </>
    )
}
