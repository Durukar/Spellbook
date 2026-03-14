import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Check, User } from 'lucide-react'
import { toast } from 'sonner'
import { useAddBuyerViewModel } from '@/viewmodels/useAddBuyerViewModel'
import type { BackendBuyer } from '@/types/buyer'

interface AddBuyerSheetProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: (created: BackendBuyer) => void
}

export function AddBuyerSheet({ isOpen, onClose, onSuccess }: AddBuyerSheetProps) {
    const vm = useAddBuyerViewModel()

    const handleClose = () => {
        vm.reset()
        onClose()
    }

    const handleSave = () => {
        vm.saveBuyer((created) => {
            toast.success('Comprador cadastrado', {
                description: `${created.name} foi adicionado com sucesso.`,
            })
            onSuccess?.(created)
            handleClose()
        })
    }

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <SheetContent
                className="w-full sm:max-w-md p-0 flex flex-col bg-[#0d0d0d] h-full border-l border-border-subtle shadow-2xl overflow-hidden"
                side="right"
            >
                <div className="relative bg-bg-muted/40 flex items-center justify-center py-10 px-8 shrink-0">
                    <div className="w-24 h-24 rounded-full bg-bg-elevated border border-border-subtle flex items-center justify-center shadow-xl ring-1 ring-white/5">
                        <User size={36} className="text-text-muted" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                    <SheetHeader className="p-0 gap-1">
                        <SheetTitle className="text-xl font-bold text-text-primary">
                            Novo Comprador
                        </SheetTitle>
                        <p className="text-sm text-text-muted">
                            Preencha os dados do comprador para cadastra-lo.
                        </p>
                    </SheetHeader>

                    {vm.error && (
                        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                            <AlertCircle size={14} className="shrink-0" />
                            {vm.error}
                        </div>
                    )}

                    <div className="h-px bg-border-subtle" />

                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="buyer-name" className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                                Nome <span className="text-red-400">*</span>
                            </Label>
                            <Input
                                id="buyer-name"
                                type="text"
                                value={vm.form.name}
                                onChange={(e) => vm.updateField('name', e.target.value)}
                                placeholder="Nome completo ou apelido"
                                className="h-10 bg-bg-elevated border-border-subtle text-text-primary"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="buyer-phone" className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                                Telefone / WhatsApp
                            </Label>
                            <Input
                                id="buyer-phone"
                                type="tel"
                                value={vm.form.phone}
                                onChange={(e) => vm.updateField('phone', e.target.value)}
                                placeholder="(11) 99999-9999"
                                className="h-10 bg-bg-elevated border-border-subtle text-text-primary"
                            />
                        </div>

                        <div className="h-px bg-border-subtle" />

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="buyer-instagram" className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                                Instagram
                            </Label>
                            <Input
                                id="buyer-instagram"
                                type="text"
                                value={vm.form.instagram}
                                onChange={(e) => vm.updateField('instagram', e.target.value)}
                                placeholder="@usuario"
                                className="h-10 bg-bg-elevated border-border-subtle text-text-primary"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="buyer-city" className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                                Cidade
                            </Label>
                            <Input
                                id="buyer-city"
                                type="text"
                                value={vm.form.city}
                                onChange={(e) => vm.updateField('city', e.target.value)}
                                placeholder="Sao Paulo"
                                className="h-10 bg-bg-elevated border-border-subtle text-text-primary"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="buyer-notes" className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                                Observacoes
                            </Label>
                            <Input
                                id="buyer-notes"
                                type="text"
                                value={vm.form.notes}
                                onChange={(e) => vm.updateField('notes', e.target.value)}
                                placeholder="Notas internas sobre o comprador"
                                className="h-10 bg-bg-elevated border-border-subtle text-text-primary"
                            />
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-border-subtle flex justify-end gap-3 shrink-0">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={vm.isLoading}
                        className="font-medium px-5 border-border-subtle text-text-secondary hover:text-text-primary"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={vm.isLoading}
                        className="gap-2 font-medium px-7"
                    >
                        {vm.isLoading ? (
                            'Salvando...'
                        ) : (
                            <>
                                <Check size={14} />
                                Salvar
                            </>
                        )}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
