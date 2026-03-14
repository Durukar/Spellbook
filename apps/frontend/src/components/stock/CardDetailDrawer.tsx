import { useState } from 'react'
import { Pencil, Trash2, X, Check, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { BackendStockItem, AcquisitionType } from '@/types/stock'
import type { CardCondition } from '@/models/Stock'
import { FoilCardOverlay, FoilBadge, FoilToggleButton } from '@/components/stock/FoilOverlay'
import { useEditStockViewModel } from '@/viewmodels/useEditStockViewModel'

const CONDITIONS: CardCondition[] = ['NM', 'SP', 'MP', 'HP', 'DMG']

const ACQUISITION_TYPE_LABELS: Record<AcquisitionType, string> = {
    purchase: 'Compra',
    accumulated: 'Acumulada',
    gift: 'Presente',
    trade: 'Trade',
}

const ACQUISITION_TYPES: AcquisitionType[] = ['purchase', 'accumulated', 'gift', 'trade']

const CONDITION_LABELS: Record<CardCondition, string> = {
    NM: 'Perfeita',
    SP: 'Levemente Jogada',
    MP: 'Moderadamente Jogada',
    HP: 'Muito Jogada',
    DMG: 'Danificada',
}

const CONDITION_COLORS: Record<CardCondition, string> = {
    NM: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    SP: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    MP: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    HP: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    DMG: 'bg-red-500/15 text-red-400 border-red-500/30',
}

const CONDITION_ACTIVE: Record<CardCondition, string> = {
    NM: 'bg-emerald-500/25 text-emerald-300 border-emerald-400/60 ring-1 ring-emerald-400/40',
    SP: 'bg-sky-500/25 text-sky-300 border-sky-400/60 ring-1 ring-sky-400/40',
    MP: 'bg-yellow-500/25 text-yellow-300 border-yellow-400/60 ring-1 ring-yellow-400/40',
    HP: 'bg-orange-500/25 text-orange-300 border-orange-400/60 ring-1 ring-orange-400/40',
    DMG: 'bg-red-500/25 text-red-300 border-red-400/60 ring-1 ring-red-400/40',
}

interface CardDetailDrawerProps {
    item: BackendStockItem
    isOpen: boolean
    onClose: () => void
    onUpdate: (updated: BackendStockItem) => void
    onDelete: (id: string) => void
}

export function CardDetailDrawer({ item, isOpen, onClose, onUpdate, onDelete }: CardDetailDrawerProps) {
    const vm = useEditStockViewModel(item)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const price = Number(item.purchase_price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    const date = new Date(item.purchase_date).toLocaleDateString('pt-BR')
    const conditionColor = CONDITION_COLORS[item.condition]
    const conditionLabel = CONDITION_LABELS[item.condition]

    const handleSave = () => {
        vm.saveEdit((updated) => {
            toast.success('Carta atualizada', {
                description: `${updated.card_name} foi salva com sucesso.`,
            })
            onUpdate(updated)
        })
    }

    const handleDeleteConfirm = () => {
        vm.confirmDelete(() => {
            toast.success('Carta removida do estoque', {
                description: `${item.card_name} foi excluida.`,
            })
            setShowDeleteConfirm(false)
            onDelete(item.id)
            onClose()
        })
    }

    return (
        <>
            <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <SheetContent
                    className="w-full sm:max-w-md p-0 flex flex-col bg-[#0d0d0d] h-full border-l border-border-subtle shadow-2xl overflow-hidden"
                    side="right"
                >
                    <div className="relative bg-bg-muted/40 flex items-center justify-center py-8 px-8 shrink-0">
                        <div
                            className={`rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 relative ${item.is_foil ? 'foil-border' : ''}`}
                            style={{ width: '200px', aspectRatio: '2.5/3.5' }}
                        >
                            {item.image_url ? (
                                <img
                                    src={item.image_url}
                                    alt={item.card_name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-text-muted text-sm p-4 text-center bg-bg-elevated">
                                    {item.card_name}
                                </div>
                            )}
                            {item.is_foil && <FoilCardOverlay />}
                        </div>

                        <div
                            className="absolute inset-0 -z-10 opacity-20 blur-2xl"
                            style={{
                                backgroundImage: item.image_url ? `url(${item.image_url})` : undefined,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                        <SheetHeader className="p-0 gap-1">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 flex-wrap min-w-0">
                                    <SheetTitle className="text-xl font-bold text-text-primary leading-snug">
                                        {item.card_name}
                                    </SheetTitle>
                                    {item.is_foil && <FoilBadge />}
                                </div>

                                {!vm.isEditing && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={vm.startEdit}
                                        className="shrink-0 text-text-muted hover:text-text-primary gap-1.5"
                                    >
                                        <Pencil size={14} />
                                        Editar
                                    </Button>
                                )}
                            </div>
                            <p className="text-sm text-text-muted">{item.set_name}</p>
                        </SheetHeader>

                        <div className="h-px bg-border-subtle" />

                        {vm.error && (
                            <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                <AlertCircle size={14} className="shrink-0" />
                                {vm.error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-text-muted">Versao</span>
                                {vm.isEditing ? (
                                    <FoilToggleButton
                                        active={vm.editForm.is_foil}
                                        onClick={() => vm.updateField('is_foil', !vm.editForm.is_foil)}
                                    />
                                ) : (
                                    item.is_foil
                                        ? <FoilBadge className="text-xs px-2 py-1" />
                                        : <span className="text-sm text-text-secondary">Normal</span>
                                )}
                            </div>

                            <div className="flex items-start justify-between gap-4">
                                <span className="text-sm text-text-muted pt-1">Condicao</span>
                                {vm.isEditing ? (
                                    <div className="flex gap-1.5 flex-wrap justify-end">
                                        {CONDITIONS.map((cond) => (
                                            <button
                                                key={cond}
                                                onClick={() => vm.updateField('condition', cond)}
                                                className={`px-2.5 py-1 rounded-md text-xs font-bold border transition-all ${
                                                    vm.editForm.condition === cond
                                                        ? CONDITION_ACTIVE[cond]
                                                        : 'border-border-subtle text-text-muted hover:border-border-default'
                                                }`}
                                            >
                                                {cond}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${conditionColor}`}>
                                        {item.condition} — {conditionLabel}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <span className="text-sm text-text-muted">Quantidade</span>
                                {vm.isEditing ? (
                                    <Input
                                        type="number"
                                        min={1}
                                        value={vm.editForm.quantity}
                                        onChange={(e) => vm.updateField('quantity', Number(e.target.value))}
                                        className="w-24 h-8 text-right bg-bg-muted border-border-subtle text-text-primary text-sm"
                                    />
                                ) : (
                                    <span className="text-sm font-semibold text-text-primary">
                                        {item.quantity}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-start justify-between gap-4">
                                <span className="text-sm text-text-muted pt-1">Origem</span>
                                {vm.isEditing ? (
                                    <div className="flex gap-1 flex-wrap justify-end">
                                        {ACQUISITION_TYPES.map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => vm.updateField('acquisition_type', type)}
                                                className={`px-2 py-1 rounded-md text-xs font-semibold border transition-all ${
                                                    vm.editForm.acquisition_type === type
                                                        ? 'bg-accent/20 text-accent border-accent/50 ring-1 ring-accent/30'
                                                        : 'border-border-subtle text-text-muted hover:border-border-default'
                                                }`}
                                            >
                                                {ACQUISITION_TYPE_LABELS[type]}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-sm font-semibold text-text-primary">
                                        {ACQUISITION_TYPE_LABELS[item.acquisition_type ?? 'purchase']}
                                    </span>
                                )}
                            </div>

                            {vm.editForm.acquisition_type === 'purchase' || !vm.isEditing ? (
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-sm text-text-muted">Preco de Compra</span>
                                {vm.isEditing ? (
                                    <Input
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        value={vm.editForm.purchase_price}
                                        onChange={(e) => vm.updateField('purchase_price', Number(e.target.value))}
                                        className="w-32 h-8 text-right bg-bg-muted border-border-subtle text-text-primary text-sm"
                                    />
                                ) : (
                                    <span className="text-sm font-semibold text-text-primary">{price}</span>
                                )}
                            </div>
                            ) : null}

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-text-muted">Data de Aquisicao</span>
                                <span className="text-sm font-semibold text-text-primary">{date}</span>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-4 border-t border-border-subtle shrink-0 flex items-center gap-3">
                        {vm.isEditing ? (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={vm.cancelEdit}
                                    disabled={vm.isSaving}
                                    className="text-text-muted hover:text-text-primary gap-1.5"
                                >
                                    <X size={14} />
                                    Cancelar
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSave}
                                    disabled={vm.isSaving}
                                    className="gap-1.5 ml-auto"
                                >
                                    <Check size={14} />
                                    {vm.isSaving ? 'Salvando...' : 'Salvar'}
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowDeleteConfirm(true)}
                                disabled={vm.isDeleting}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-1.5 ml-auto"
                            >
                                <Trash2 size={14} />
                                Excluir
                            </Button>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <DialogContent className="bg-[#0d0d0d] border-border-subtle">
                    <DialogHeader>
                        <DialogTitle>Confirmar exclusao</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-text-muted">
                        Tem certeza que deseja remover <span className="font-semibold text-text-primary">{item.card_name}</span> do estoque? Esta acao nao pode ser desfeita.
                    </p>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={vm.isDeleting}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDeleteConfirm}
                            disabled={vm.isDeleting}
                        >
                            {vm.isDeleting ? 'Excluindo...' : 'Confirmar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
