import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ShoppingCart, AlertTriangle, ChevronRight, ChevronLeft,
    Check, X, Minus, Plus, User, FileText, ChevronDown,
} from 'lucide-react'
import { toast } from 'sonner'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiService } from '@/services/apiService'
import { useCreateSaleViewModel, type SaleLineItem } from '@/viewmodels/useCreateSaleViewModel'
import type { BackendStockItem } from '@/types/stock'
import type { BackendBuyer } from '@/types/buyer'
import type { PaymentMethod } from '@/types/sale'
import { FoilBadge } from '@/components/stock/FoilOverlay'


function BuyerPicker({
    buyers,
    value,
    onChange,
}: {
    buyers: BackendBuyer[]
    value: string | null
    onChange: (id: string | null) => void
}) {
    const [open, setOpen] = useState(false)

    const selected = buyers.find((b) => b.id === value) ?? null

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className={`w-full flex items-center gap-3 h-10 px-3 rounded-md border text-sm transition-colors ${
                    open
                        ? 'border-ring ring-2 ring-ring/30 bg-neutral-900'
                        : 'border-input bg-neutral-900 hover:border-neutral-600'
                }`}
            >
                {selected ? (
                    <>
                        <span className="flex-1 text-left text-text-primary truncate">{selected.name}</span>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onChange(null) }}
                            className="text-neutral-500 hover:text-red-400 transition-colors"
                        >
                            <X size={13} />
                        </button>
                    </>
                ) : (
                    <>
                        <span className="flex-1 text-left text-neutral-500">Selecionar comprador...</span>
                        <ChevronDown size={14} className="text-neutral-500 shrink-0" />
                    </>
                )}
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-md border border-neutral-700 bg-neutral-900 shadow-xl overflow-hidden">
                        <div className="max-h-52 overflow-y-auto p-1">
                            {buyers.length === 0 ? (
                                <div className="py-4 text-center text-sm text-neutral-500">Nenhum comprador cadastrado</div>
                            ) : (
                                buyers.map((b) => (
                                    <button
                                        key={b.id}
                                        type="button"
                                        onClick={() => { onChange(b.id); setOpen(false) }}
                                        className={`w-full flex items-center gap-2 px-2 py-2 rounded-sm text-sm transition-colors text-left ${
                                            value === b.id
                                                ? 'bg-accent/20 text-accent'
                                                : 'text-neutral-100 hover:bg-neutral-800'
                                        }`}
                                    >
                                        <span className="flex-1 truncate">{b.name}</span>
                                        {value === b.id && <Check size={13} className="shrink-0" />}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
    { value: 'pix', label: 'PIX' },
    { value: 'dinheiro', label: 'Dinheiro' },
    { value: 'fiado', label: 'Fiado' },
    { value: 'cartao', label: 'Cartao' },
    { value: 'troca', label: 'Troca' },
]

function MarginBadge({ purchasePrice, salePrice }: { purchasePrice: number; salePrice: number }) {
    if (purchasePrice === 0) return null
    const pct = ((salePrice - purchasePrice) / purchasePrice) * 100
    const color =
        pct >= 0 ? 'text-emerald-400 bg-emerald-500/10'
        : pct >= -15 ? 'text-yellow-400 bg-yellow-500/10'
        : 'text-red-400 bg-red-500/10'
    return (
        <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${color}`}>
            {pct >= 0 ? '+' : ''}{pct.toFixed(0)}%
        </span>
    )
}

function StockItemRow({
    item,
    selected,
    onToggle,
}: {
    item: BackendStockItem
    selected: boolean
    onToggle: () => void
}) {
    const price = Number(item.purchase_price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

    return (
        <div
            onClick={onToggle}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer ${
                selected
                    ? 'border-accent bg-accent/10'
                    : 'border-border-subtle bg-bg-elevated hover:border-border-default'
            }`}
        >
            <div className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${
                selected ? 'bg-accent border-accent' : 'border-border-default'
            }`}>
                {selected && <Check size={10} className="text-white" />}
            </div>

            <div className="w-10 shrink-0 rounded-md overflow-hidden bg-bg-muted" style={{ aspectRatio: '2.5/3.5' }}>
                {item.image_url ? (
                    <img src={item.image_url} alt={item.card_name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-bg-muted" />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-text-primary truncate">{item.card_name}</p>
                    {item.is_foil && <FoilBadge />}
                </div>
                <p className="text-xs text-text-muted truncate">{item.set_name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-bold bg-bg-muted text-text-secondary px-1.5 py-0.5 rounded border border-border-subtle">
                        {item.condition}
                    </span>
                    <span className="text-xs text-text-muted">Qtd: {item.quantity}</span>
                </div>
            </div>

            <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-text-primary">{price}</p>
                <p className="text-xs text-text-muted">custo</p>
            </div>
        </div>
    )
}

function SaleItemEditor({
    item,
    onRemove,
    onPriceChange,
    onQtyChange,
}: {
    item: SaleLineItem
    onRemove: () => void
    onPriceChange: (v: number) => void
    onQtyChange: (v: number) => void
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="bg-bg-elevated border border-border-subtle rounded-xl p-3 space-y-3"
        >
            <div className="flex items-center gap-2">
                <div className="w-8 shrink-0 rounded overflow-hidden" style={{ aspectRatio: '2.5/3.5' }}>
                    {item.image_url ? (
                        <img src={item.image_url} alt={item.card_name} className="w-full h-full object-cover" />
                    ) : <div className="w-full h-full bg-bg-muted" />}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">{item.card_name}</p>
                    <p className="text-xs text-text-muted">{item.condition}{item.is_foil ? ' · Foil' : ''}</p>
                </div>
                <button onClick={onRemove} className="text-text-muted hover:text-red-400 transition-colors">
                    <X size={14} />
                </button>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex-1">
                    <Label className="text-xs text-text-muted">Preco de Venda (R$)</Label>
                    <div className="flex items-center gap-2 mt-1">
                        <Input
                            type="number"
                            min={0}
                            step={0.5}
                            value={item.sale_price}
                            onChange={(e) => onPriceChange(Number(e.target.value))}
                            className="h-8 bg-bg-muted border-border-subtle text-text-primary text-sm font-mono"
                        />
                        <MarginBadge purchasePrice={item.purchase_price} salePrice={item.sale_price} />
                    </div>
                </div>

                <div>
                    <Label className="text-xs text-text-muted">Qtd</Label>
                    <div className="flex items-center gap-1 mt-1">
                        <button
                            onClick={() => onQtyChange(item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-7 h-8 rounded border border-border-subtle text-text-muted hover:text-text-primary disabled:opacity-30 flex items-center justify-center"
                        >
                            <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold text-text-primary">
                            {item.quantity}
                        </span>
                        <button
                            onClick={() => onQtyChange(item.quantity + 1)}
                            disabled={item.quantity >= item.max_quantity}
                            className="w-7 h-8 rounded border border-border-subtle text-text-muted hover:text-text-primary disabled:opacity-30 flex items-center justify-center"
                        >
                            <Plus size={12} />
                        </button>
                    </div>
                </div>
            </div>

            <p className="text-xs text-text-muted">
                Custo: {Number(item.purchase_price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                {' · '}
                Subtotal: {(item.sale_price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
        </motion.div>
    )
}

interface CreateSaleSheetProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function CreateSaleSheet({ isOpen, onClose, onSuccess }: CreateSaleSheetProps) {
    const vm = useCreateSaleViewModel()
    const [step, setStep] = useState<1 | 2>(1)
    const [stock, setStock] = useState<BackendStockItem[]>([])
    const [buyers, setBuyers] = useState<BackendBuyer[]>([])
    const [loadingStock, setLoadingStock] = useState(false)

    useEffect(() => {
        if (!isOpen) return
        setLoadingStock(true)
        Promise.all([apiService.listStockItems(), apiService.listBuyers()])
            .then(([s, b]) => { setStock(s); setBuyers(b) })
            .finally(() => setLoadingStock(false))
    }, [isOpen])

    const handleClose = () => {
        vm.reset()
        setStep(1)
        onClose()
    }

    const handleSubmit = async () => {
        const itemCount = vm.selectedItems.length
        const ok = await vm.submitSale()
        if (ok) {
            toast.success('Venda registrada com sucesso', {
                description: `${itemCount} ${itemCount === 1 ? 'carta vendida' : 'cartas vendidas'}.`,
            })
            handleClose()
            onSuccess()
        } else if (vm.error) {
            toast.error('Erro ao registrar venda', { description: vm.error })
        }
    }

    const isItemSelected = (id: string) =>
        vm.selectedItems.some((i) => i.stock_item_id === id)

    const toggleItem = (item: BackendStockItem) => {
        if (isItemSelected(item.id)) {
            vm.removeItem(item.id)
        } else {
            vm.addItem(item)
        }
    }

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <SheetContent
                className="w-full sm:max-w-lg p-0 flex flex-col bg-[#0d0d0d] h-full border-l border-border-subtle shadow-2xl overflow-hidden [&>button]:hidden"
                side="right"
            >
                <SheetHeader className="px-6 py-4 border-b border-border-subtle shrink-0">
                    <div className="flex items-center gap-3">
                        <ShoppingCart size={18} className="text-text-muted" />
                        <SheetTitle className="text-base font-bold text-text-primary">
                            {step === 1 ? 'Selecionar Itens' : 'Finalizar Venda'}
                        </SheetTitle>
                        <span className="ml-auto text-xs text-text-muted">{step}/2</span>
                    </div>
                    <div className="flex gap-1 mt-1">
                        <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-accent' : 'bg-border-subtle'}`} />
                        <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-accent' : 'bg-border-subtle'}`} />
                    </div>
                </SheetHeader>

                {step === 1 && (
                    <div className="flex-1 overflow-hidden flex flex-col">
                        {vm.hasStopLossViolation && (
                            <div className="mx-4 mt-4 flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                                <div className="flex-1 text-sm">
                                    <p className="font-semibold">Stop Loss ativado</p>
                                    <p className="text-xs mt-0.5 text-red-400/80">
                                        {vm.stopLossItems.length}{' '}
                                        {vm.stopLossItems.length === 1 ? 'item esta' : 'itens estao'} sendo vendido(s) com prejuizo acima de 15%.
                                    </p>
                                </div>
                                {!vm.stopLossConfirmed && (
                                    <button
                                        onClick={vm.confirmStopLoss}
                                        className="text-xs font-semibold underline shrink-0"
                                    >
                                        Confirmar
                                    </button>
                                )}
                                {vm.stopLossConfirmed && (
                                    <span className="text-xs font-semibold text-red-300 shrink-0">Confirmado</span>
                                )}
                            </div>
                        )}

                        {vm.selectedItems.length > 0 && (
                            <div className="px-4 py-3 border-b border-border-subtle shrink-0">
                                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                                    Itens selecionados ({vm.selectedItems.length})
                                </p>
                                <div className="space-y-2">
                                    <AnimatePresence>
                                        {vm.selectedItems.map((item) => (
                                            <SaleItemEditor
                                                key={item.stock_item_id}
                                                item={item}
                                                onRemove={() => vm.removeItem(item.stock_item_id)}
                                                onPriceChange={(v) => vm.updateSalePrice(item.stock_item_id, v)}
                                                onQtyChange={(v) => vm.updateQuantity(item.stock_item_id, v)}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto px-4 py-3">
                            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                                Estoque disponivel
                            </p>
                            {loadingStock ? (
                                <div className="text-center text-text-muted py-8 text-sm">Carregando...</div>
                            ) : stock.length === 0 ? (
                                <div className="text-center text-text-muted py-8 text-sm">Nenhum item no estoque.</div>
                            ) : (
                                <div className="space-y-2">
                                    {stock.map((item) => (
                                        <StockItemRow
                                            key={item.id}
                                            item={item}
                                            selected={isItemSelected(item.id)}
                                            onToggle={() => toggleItem(item)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                                <User size={12} />
                                Comprador (opcional)
                            </Label>
                            <BuyerPicker
                                buyers={buyers}
                                value={vm.buyerId}
                                onChange={vm.setBuyerId}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                                Forma de Pagamento
                            </Label>
                            <div className="flex gap-2 flex-wrap">
                                {PAYMENT_METHODS.map((m) => (
                                    <button
                                        key={m.value}
                                        onClick={() => vm.setPaymentMethod(m.value)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all ${
                                            vm.paymentMethod === m.value
                                                ? 'border-accent bg-accent/15 text-accent'
                                                : 'border-border-subtle text-text-muted hover:border-border-default'
                                        }`}
                                    >
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                                <FileText size={12} />
                                Observacoes (opcional)
                            </Label>
                            <Input
                                value={vm.notes}
                                onChange={(e) => vm.setNotes(e.target.value)}
                                placeholder="Anotacoes sobre a venda..."
                                className="h-10 bg-bg-elevated border-border-subtle text-text-primary"
                            />
                        </div>

                        <div className="h-px bg-border-subtle" />

                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Resumo</p>
                            {vm.selectedItems.map((i) => (
                                <div key={i.stock_item_id} className="flex justify-between text-sm">
                                    <span className="text-text-muted truncate">{i.card_name} ×{i.quantity}</span>
                                    <span className="text-text-primary font-medium shrink-0 ml-2">
                                        {(i.sale_price * i.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </span>
                                </div>
                            ))}
                            <div className="h-px bg-border-subtle" />
                            {vm.totalDiscount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-yellow-400">Desconto concedido</span>
                                    <span className="text-yellow-400 font-medium">
                                        -{vm.totalDiscount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="font-bold text-text-primary">Total</span>
                                <span className="font-bold text-text-primary text-lg">
                                    {vm.totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                            </div>
                        </div>

                        {vm.error && (
                            <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                <AlertTriangle size={14} className="shrink-0" />
                                {vm.error}
                            </div>
                        )}
                    </div>
                )}

                <div className="px-6 py-4 border-t border-border-subtle shrink-0 flex items-center gap-3">
                    {step === 1 ? (
                        <>
                            <Button variant="outline" onClick={handleClose} className="border-border-subtle text-text-secondary">
                                Cancelar
                            </Button>
                            <Button
                                className="ml-auto gap-1.5"
                                disabled={vm.selectedItems.length === 0 || (vm.hasStopLossViolation && !vm.stopLossConfirmed)}
                                onClick={() => setStep(2)}
                            >
                                Continuar
                                <ChevronRight size={14} />
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" onClick={() => setStep(1)} className="gap-1.5 text-text-muted">
                                <ChevronLeft size={14} />
                                Voltar
                            </Button>
                            <Button
                                className="ml-auto gap-1.5"
                                onClick={handleSubmit}
                                disabled={vm.isLoading}
                            >
                                <Check size={14} />
                                {vm.isLoading ? 'Registrando...' : 'Confirmar Venda'}
                            </Button>
                        </>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
