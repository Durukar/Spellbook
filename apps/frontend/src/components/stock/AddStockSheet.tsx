import { useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
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
    { value: 'NM', label: 'Near Mint (NM)' },
    { value: 'SP', label: 'Slightly Played (SP)' },
    { value: 'MP', label: 'Moderately Played (MP)' },
    { value: 'HP', label: 'Heavily Played (HP)' },
    { value: 'DMG', label: 'Damaged (DMG)' },
];

export function AddStockSheet({ card, isOpen, onClose, onSuccess }: AddStockSheetProps) {
    const vm = useAddStockViewModel(card);
    const [hoveredPrintingId, setHoveredPrintingId] = useState<string | null>(null);

    if (!card) return null;

    const displayCard = hoveredPrintingId
        ? vm.printings.find(p => p.id === hoveredPrintingId) || vm.selectedCard
        : vm.selectedCard;

    const handleSave = async () => {
        const success = await vm.saveStockItem();
        if (success) {
            onSuccess?.();
            onClose();
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-full sm:max-w-md p-0 flex flex-col bg-[#fefefe] dark:bg-background h-full border-l shadow-2xl">
                <div className="p-6 flex-1 overflow-y-auto space-y-6">
                    <SheetHeader className="text-left mb-4 mt-2 px-1">
                        <SheetTitle className="text-[22px] font-semibold tracking-tight text-foreground/90">Adicionar ao Estoque</SheetTitle>
                        <SheetDescription className="text-[14px] mt-1.5 text-muted-foreground/80">
                            Preencha os dados de aquisição da carta.
                        </SheetDescription>
                    </SheetHeader>

                    {vm.error && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <p className="font-medium">{vm.error}</p>
                        </div>
                    )}

                    {/* Section 1: Item selecionado */}
                    <div className="bg-card dark:bg-muted/10 border border-border/60 rounded-xl p-5 shadow-sm flex flex-col gap-4">
                        <h3 className="text-[13px] font-semibold text-foreground tracking-wide">Item Selecionado</h3>
                        <div className="flex items-center gap-5">
                            <div className="w-16 rounded-md overflow-hidden border border-border/50 shadow-sm relative aspect-[2.5/3.5] bg-muted/30 shrink-0">
                                {(displayCard?.image_uris?.normal || displayCard?.card_faces?.[0]?.image_uris?.normal) && (
                                    <img
                                        src={displayCard?.image_uris?.normal || displayCard?.card_faces?.[0]?.image_uris?.normal}
                                        alt={displayCard?.name}
                                        className="w-full h-full object-cover transition-all duration-200"
                                    />
                                )}
                            </div>
                            <div className="flex flex-col w-full gap-2 overflow-hidden">
                                <div className="flex flex-col">
                                    <span className="font-bold text-base leading-tight text-foreground truncate">{displayCard?.name}</span>
                                    {vm.printings.length === 0 ? (
                                        <span className="text-xs text-muted-foreground mt-0.5 truncate">{displayCard?.set_name}</span>
                                    ) : (
                                        <span className="text-xs text-muted-foreground mt-0.5 opacity-0">.</span>
                                    )}
                                </div>

                                {vm.printings.length > 0 ? (
                                    <Select
                                        value={vm.selectedCard?.id}
                                        onValueChange={(id) => {
                                            const selected = vm.printings.find(p => p.id === id);
                                            if (selected) vm.setSelectedCard(selected);
                                            setHoveredPrintingId(null); // Reset hover state on selection
                                        }}
                                        onOpenChange={(open) => {
                                            if (!open) setHoveredPrintingId(null);
                                        }}
                                    >
                                        <SelectTrigger className="h-8 text-[13px] w-full bg-background" aria-label="Edição da Carta">
                                            <SelectValue placeholder="Selecione a edição">
                                                {vm.selectedCard ? `${vm.selectedCard.set_name} #${vm.selectedCard.collector_number} ${vm.selectedCard.prices?.usd ? `- $${vm.selectedCard.prices.usd}` : ''}` : "Selecione a edição"}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent className="w-auto min-w-max">
                                            {vm.printings.map((p) => {
                                                const imageUrl = p.image_uris?.normal || p.card_faces?.[0]?.image_uris?.normal;
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
                                                                    {p.set_name} #{p.collector_number} {p.prices?.usd ? `- $${p.prices.usd}` : ''}
                                                                </div>
                                                            </HoverCardTrigger>
                                                            {imageUrl && (
                                                                <HoverCardContent side="left" sideOffset={12} className="w-auto p-1.5 rounded-xl border-border/50 shadow-xl data-closed:hidden">
                                                                    <img
                                                                        src={imageUrl}
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
                                    <div className="h-8 w-full animate-pulse bg-muted rounded-md" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Dados Financeiros */}
                    <div className="bg-card dark:bg-muted/10 border border-border/60 rounded-xl p-5 shadow-sm flex flex-col gap-5">
                        <h3 className="text-[13px] font-semibold text-foreground tracking-wide">Dados Financeiros</h3>
                        <div className="grid grid-cols-2 gap-5">
                            <div className="flex flex-col gap-2.5">
                                <Label htmlFor="price-drawer" className="text-muted-foreground font-medium text-[12px] uppercase tracking-wider">
                                    Preço Pago
                                </Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
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
                                        className="pl-9 h-10 bg-background font-mono"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2.5">
                                <Label htmlFor="quantity-drawer" className="text-muted-foreground font-medium text-[12px] uppercase tracking-wider">
                                    Quantidade
                                </Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
                                        <Hash className="h-4 w-4 shrink-0" />
                                    </div>
                                    <Input
                                        id="quantity-drawer"
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={vm.quantity}
                                        onChange={(e) => vm.setQuantity(parseInt(e.target.value) || 1)}
                                        className="pl-9 h-10 bg-background font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Condição (Segmented Control) */}
                    <div className="bg-card dark:bg-muted/10 border border-border/60 rounded-xl p-5 shadow-sm flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[13px] font-semibold text-foreground tracking-wide">Estado de Conservação</h3>
                            <span className="text-[12px] font-semibold text-primary">
                                {CONDITIONS.find((c) => c.value === vm.condition)?.label}
                            </span>
                        </div>

                        <div className="flex p-1 bg-muted/40 rounded-lg border border-border/40 mt-1">
                            {CONDITIONS.map((c) => {
                                const isSelected = vm.condition === c.value;
                                return (
                                    <button
                                        key={c.value}
                                        type="button"
                                        onClick={() => vm.setCondition(c.value)}
                                        className={`
                                            flex-1 py-1.5 text-sm font-bold rounded-md transition-all duration-200
                                            ${isSelected
                                                ? 'bg-background text-foreground shadow-sm ring-1 ring-border/80'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                                            }
                                        `}
                                        title={c.label}
                                    >
                                        {c.value}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="bg-muted/20 dark:bg-background p-5 border-t border-border/50 flex justify-end gap-3 shrink-0">
                    <Button variant="outline" onClick={onClose} disabled={vm.isLoading} className="font-medium px-5">
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={vm.isLoading} className="gap-2 font-medium shadow-sm px-7">
                        {vm.isLoading ? 'Salvando...' : (
                            <>
                                <Check className="w-4 h-4 mr-1" />
                                Salvar
                            </>
                        )}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
