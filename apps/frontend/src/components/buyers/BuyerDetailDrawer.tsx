import { useState } from 'react'
import { Pencil, Trash2, X, Check, AlertCircle, Phone, MapPin, Instagram } from 'lucide-react'
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
import type { BackendBuyer } from '@/types/buyer'
import { useEditBuyerViewModel } from '@/viewmodels/useEditBuyerViewModel'

interface BuyerDetailDrawerProps {
    buyer: BackendBuyer
    isOpen: boolean
    onClose: () => void
    onUpdate: (updated: BackendBuyer) => void
    onDelete: (id: string) => void
}

function BuyerAvatar({ name }: { name: string }) {
    const initials = name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase() ?? '')
        .join('')

    return (
        <div className="w-20 h-20 rounded-full bg-bg-elevated border border-border-subtle flex items-center justify-center shadow-xl ring-1 ring-white/5 text-2xl font-bold text-text-primary">
            {initials}
        </div>
    )
}

export function BuyerDetailDrawer({ buyer, isOpen, onClose, onUpdate, onDelete }: BuyerDetailDrawerProps) {
    const vm = useEditBuyerViewModel(buyer)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const handleSave = () => {
        vm.saveEdit((updated) => {
            onUpdate(updated)
        })
    }

    const handleDeleteConfirm = () => {
        vm.confirmDelete(() => {
            setShowDeleteConfirm(false)
            onDelete(buyer.id)
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
                    <div className="relative bg-bg-muted/40 flex items-center justify-center py-10 px-8 shrink-0">
                        <BuyerAvatar name={buyer.name} />
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                        <SheetHeader className="p-0 gap-1">
                            <div className="flex items-center justify-between gap-2">
                                <SheetTitle className="text-xl font-bold text-text-primary leading-snug">
                                    {buyer.name}
                                </SheetTitle>

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
                        </SheetHeader>

                        <div className="h-px bg-border-subtle" />

                        {vm.error && (
                            <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                <AlertCircle size={14} className="shrink-0" />
                                {vm.error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-sm text-text-muted flex items-center gap-1.5">
                                    <Phone size={13} />
                                    Telefone
                                </span>
                                {vm.isEditing ? (
                                    <Input
                                        type="tel"
                                        value={vm.editForm.phone}
                                        onChange={(e) => vm.updateField('phone', e.target.value)}
                                        className="w-44 h-8 text-right bg-bg-muted border-border-subtle text-text-primary text-sm"
                                    />
                                ) : (
                                    <span className="text-sm font-semibold text-text-primary">
                                        {buyer.phone}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <span className="text-sm text-text-muted flex items-center gap-1.5">
                                    <Instagram size={13} />
                                    Instagram
                                </span>
                                {vm.isEditing ? (
                                    <Input
                                        type="text"
                                        value={vm.editForm.instagram}
                                        onChange={(e) => vm.updateField('instagram', e.target.value)}
                                        placeholder="@usuario"
                                        className="w-44 h-8 text-right bg-bg-muted border-border-subtle text-text-primary text-sm"
                                    />
                                ) : (
                                    <span className="text-sm font-semibold text-text-primary">
                                        {buyer.instagram ?? '—'}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <span className="text-sm text-text-muted flex items-center gap-1.5">
                                    <MapPin size={13} />
                                    Cidade
                                </span>
                                {vm.isEditing ? (
                                    <Input
                                        type="text"
                                        value={vm.editForm.city}
                                        onChange={(e) => vm.updateField('city', e.target.value)}
                                        placeholder="Sao Paulo"
                                        className="w-44 h-8 text-right bg-bg-muted border-border-subtle text-text-primary text-sm"
                                    />
                                ) : (
                                    <span className="text-sm font-semibold text-text-primary">
                                        {buyer.city ?? '—'}
                                    </span>
                                )}
                            </div>

                            {(buyer.notes || vm.isEditing) && (
                                <>
                                    <div className="h-px bg-border-subtle" />

                                    <div className="flex flex-col gap-2">
                                        <span className="text-sm text-text-muted">Observacoes</span>
                                        {vm.isEditing ? (
                                            <Input
                                                type="text"
                                                value={vm.editForm.notes}
                                                onChange={(e) => vm.updateField('notes', e.target.value)}
                                                placeholder="Notas internas"
                                                className="h-8 bg-bg-muted border-border-subtle text-text-primary text-sm"
                                            />
                                        ) : (
                                            <p className="text-sm text-text-secondary">{buyer.notes}</p>
                                        )}
                                    </div>
                                </>
                            )}

                            {vm.isEditing && (
                                <>
                                    <div className="h-px bg-border-subtle" />
                                    <div className="flex flex-col gap-2">
                                        <span className="text-sm text-text-muted">Nome</span>
                                        <Input
                                            type="text"
                                            value={vm.editForm.name}
                                            onChange={(e) => vm.updateField('name', e.target.value)}
                                            className="h-8 bg-bg-muted border-border-subtle text-text-primary text-sm"
                                        />
                                    </div>
                                </>
                            )}
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
                        Tem certeza que deseja remover <span className="font-semibold text-text-primary">{buyer.name}</span> da sua lista de compradores? Esta acao nao pode ser desfeita.
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
