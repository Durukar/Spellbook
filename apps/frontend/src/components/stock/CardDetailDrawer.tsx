import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import type { BackendStockItem } from '@/types/stock'
import type { CardCondition } from '@/models/Stock'

const CONDITION_LABELS: Record<CardCondition, string> = {
    NM: 'Near Mint',
    SP: 'Slightly Played',
    MP: 'Moderately Played',
    HP: 'Heavily Played',
    DMG: 'Damaged',
}

const CONDITION_COLORS: Record<CardCondition, string> = {
    NM: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    SP: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
    MP: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    HP: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    DMG: 'bg-red-500/15 text-red-400 border-red-500/30',
}

interface CardDetailDrawerProps {
    item: BackendStockItem
    isOpen: boolean
    onClose: () => void
}

export function CardDetailDrawer({ item, isOpen, onClose }: CardDetailDrawerProps) {
    const price = Number(item.purchase_price).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    })

    const date = new Date(item.purchase_date).toLocaleDateString('pt-BR')
    const conditionColor = CONDITION_COLORS[item.condition]
    const conditionLabel = CONDITION_LABELS[item.condition]

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent
                className="w-full sm:max-w-md p-0 flex flex-col bg-[#0d0d0d] h-full border-l border-border-subtle shadow-2xl overflow-hidden"
                side="right"
            >
                <div className="relative bg-bg-muted/40 flex items-center justify-center py-8 px-8 shrink-0">
                    <div
                        className="rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10"
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
                        <SheetTitle className="text-xl font-bold text-text-primary leading-snug">
                            {item.card_name}
                        </SheetTitle>
                        <p className="text-sm text-text-muted">{item.set_name}</p>
                    </SheetHeader>

                    <div className="h-px bg-border-subtle" />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-text-muted">Condição</span>
                            <span
                                className={`px-2.5 py-1 rounded-md text-xs font-bold border ${conditionColor}`}
                            >
                                {item.condition} — {conditionLabel}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-text-muted">Quantidade</span>
                            <span className="text-sm font-semibold text-text-primary">
                                {item.quantity}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-text-muted">Preço de Compra</span>
                            <span className="text-sm font-semibold text-text-primary">{price}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-text-muted">Data de Aquisição</span>
                            <span className="text-sm font-semibold text-text-primary">{date}</span>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
