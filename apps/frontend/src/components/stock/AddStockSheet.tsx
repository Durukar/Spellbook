import { useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    HoverCard,
    HoverCardTrigger,
    HoverCardContent,
} from '@/components/ui/hover-card';

import { AlertCircle, DollarSign, Hash, Check } from 'lucide-react';
import type { ScryfallCard } from '@/types/scryfall';
import type { CardCondition } from '@/models/Stock';
import { useAddStockViewModel } from '@/viewmodels/useAddStockViewModel';

interface AddStockSheetProps {
    card: ScryfallCard | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const CONDITIONS: { value: CardCondition; label: string }[] = [
    { value: 'NM', label: 'Near Mint' },
    { value: 'SP', label: 'Slightly Played' },
    { value: 'MP', label: 'Moderately Played' },
    { value: 'HP', label: 'Heavily Played' },
    { value: 'DMG', label: 'Damaged' },
];

const CONDITION_COLORS: Record<CardCondition, string> = {
    NM: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    SP: 'bg-sky-500/20 text-sky-400 border-sky-500/40',
    MP: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    HP: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    DMG: 'bg-red-500/20 text-red-400 border-red-500/40',
};

export function AddStockSheet({ card, isOpen, onClose, onSuccess }: AddStockSheetProps) {
    const vm = useAddStockViewModel(card);
    const [hoveredPrintingId, setHoveredPrintingId] = useState<string | null>(null);

    if (!card) return null;

    const displayCard = hoveredPrintingId
        ? vm.printings.find(p => p.id === hoveredPrintingId) || vm.selectedCard
        : vm.selectedCard;

    const imageUrl =
        displayCard?.image_uris?.normal ?? displayCard?.card_faces?.[0]?.image_uris?.normal;

    const handleSave = async () => {
        const success = await vm.saveStockItem();
        if (success) {
            onSuccess?.();
            onClose();
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent
                className="w-full sm:max-w-md p-0 flex flex-col bg-[#0d0d0d] h-full border-l border-border-subtle shadow-2xl overflow-hidden"
                side="right"
            >
                {/* Imagem */}
                <div className="relative bg-bg-muted/40 flex items-center justify-center py-8 px-8 shrink-0">
                    <div
                        className="rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10"
                        style={{ width: '200px', aspectRatio: '2.5/3.5' }}
                    >
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={displayCard?.name}
                                className="w-full h-full object-cover transition-all duration-300"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-text-muted text-sm p-4 text-center bg-bg-elevated">
                                {displayCard?.name}
                            </div>
                        )}
                    </div>

                    <div
                        className="absolute inset-0 -z-10 opacity-20 blur-2xl"
                        style={{
                            backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    />
                </div>

                {/* Conteudo */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                    {vm.error && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <p className="font-medium">{vm.error}</p>
                        </div>
                    )}

                    <SheetHeader className="p-0 gap-2">
                        <SheetTitle className="text-xl font-bold text-text-primary leading-snug">
                            {displayCard?.name}
                        </SheetTitle>

                        {vm.printings.length > 0 ? (
                            <Select
                                value={vm.selectedCard?.id}
                                onValueChange={(id) => {
                                    const selected = vm.printings.find(p => p.id === id);
                                    if (selected) vm.setSelectedCard(selected);
                                    setHoveredPrintingId(null);
                                }}
                                onOpenChange={(open) => {
                                    if (!open) setHoveredPrintingId(null);
                                }}
                            >
                                <SelectTrigger
                                    className="h-8 text-[13px] w-full bg-bg-elevated border-border-subtle text-text-secondary"
                                    aria-label="Edição da Carta"
                                >
                                    <SelectValue placeholder="Selecione a edição">
                                        {vm.selectedCard
                                            ? `${vm.selectedCard.set_name} #${vm.selectedCard.collector_number}${vm.selectedCard.prices?.usd ? ` — $${vm.selectedCard.prices.usd}` : ''}`
                                            : 'Selecione a edição'}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="w-auto min-w-max">
                                    {vm.printings.map((p) => {
                                        const pImageUrl =
                                            p.image_uris?.normal ?? p.card_faces?.[0]?.image_uris?.normal;
                                        return (
                                            <SelectItem
                                                key={p.id}
                                                value={p.id}
                                                className="text-[13px] p-0 m-0 cursor-pointer"
                                            >
                                                <HoverCard open={hoveredPrintingId === p.id}>
                                                    <HoverCardTrigger className="block w-full">
                                                        <div
                                                            className="w-full flex py-1.5 px-8"
                                                            onMouseEnter={() => setHoveredPrintingId(p.id)}
                                                            onMouseLeave={() => setHoveredPrintingId(null)}
                                                        >
                                                            {p.set_name} #{p.collector_number}{' '}
                                                            {p.prices?.usd ? `— $${p.prices.usd}` : ''}
                                                        </div>
                                                    </HoverCardTrigger>
                                                    {pImageUrl && (
                                                        <HoverCardContent
                                                            side="left"
                                                            sideOffset={12}
                                                            className="w-auto p-1.5 rounded-xl border-border/50 shadow-xl data-closed:hidden"
                                                        >
                                                            <img
                                                                src={pImageUrl}
                                                                alt={p.name}
                                                                className="w-44 rounded-lg"
                                                            />
                                                        </HoverCardContent>
                                                    )}
                                                </HoverCard>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        ) : (
                            <p className="text-sm text-text-muted">{displayCard?.set_name}</p>
                        )}
                    </SheetHeader>

                    <div className="h-px bg-border-subtle" />

                    {/* Dados financeiros */}
                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <Label
                                htmlFor="price-drawer"
                                className="text-xs font-semibold text-text-muted uppercase tracking-wider"
                            >
                                Preço Pago
                            </Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-muted">
                                    <DollarSign className="h-4 w-4 shrink-0" />
                                </div>
                                <Input
                                    id="price-drawer"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={vm.price}
                                    onChange={(e) => vm.setPrice(e.target.value)}
                                    placeholder="0.00"
                                    className="pl-9 h-10 bg-bg-elevated border-border-subtle font-mono text-text-primary"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label
                                htmlFor="quantity-drawer"
                                className="text-xs font-semibold text-text-muted uppercase tracking-wider"
                            >
                                Quantidade
                            </Label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-muted">
                                    <Hash className="h-4 w-4 shrink-0" />
                                </div>
                                <Input
                                    id="quantity-drawer"
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={vm.quantity}
                                    onChange={(e) => vm.setQuantity(parseInt(e.target.value) || 1)}
                                    className="pl-9 h-10 bg-bg-elevated border-border-subtle font-mono text-text-primary"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-border-subtle" />

                    {/* Condicao */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                                Estado de Conservação
                            </span>
                            <span
                                className={`px-2 py-0.5 rounded text-xs font-bold border ${CONDITION_COLORS[vm.condition]}`}
                            >
                                {vm.condition}
                            </span>
                        </div>

                        <div className="flex p-1 bg-bg-muted/40 rounded-lg border border-border-subtle gap-0.5">
                            {CONDITIONS.map((c) => {
                                const isSelected = vm.condition === c.value;
                                return (
                                    <button
                                        key={c.value}
                                        type="button"
                                        onClick={() => vm.setCondition(c.value)}
                                        title={c.label}
                                        className={`
                                            flex-1 py-1.5 text-sm font-bold rounded-md transition-all duration-200
                                            ${isSelected
                                                ? `${CONDITION_COLORS[c.value]} border shadow-sm`
                                                : 'text-text-muted hover:text-text-secondary hover:bg-bg-muted/60'
                                            }
                                        `}
                                    >
                                        {c.value}
                                    </button>
                                );
                            })}
                        </div>

                        <p className="text-xs text-text-muted text-center">
                            {CONDITIONS.find(c => c.value === vm.condition)?.label}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border-subtle flex justify-end gap-3 shrink-0">
                    <Button
                        variant="outline"
                        onClick={onClose}
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
                                <Check className="w-4 h-4" />
                                Salvar
                            </>
                        )}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
