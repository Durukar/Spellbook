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
import { AlertCircle, DollarSign, Hash, Check, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import type { ScryfallCard } from '@/types/scryfall';
import type { CardCondition } from '@/models/Stock';
import { useAddStockViewModel } from '@/viewmodels/useAddStockViewModel';
import { FoilCardOverlay, FoilToggleButton } from '@/components/stock/FoilOverlay';

interface AddStockSheetProps {
    card: ScryfallCard | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const CONDITIONS: { value: CardCondition; label: string }[] = [
    { value: 'NM', label: 'Perfeita' },
    { value: 'SP', label: 'Levemente Jogada' },
    { value: 'MP', label: 'Moderadamente Jogada' },
    { value: 'HP', label: 'Muito Jogada' },
    { value: 'DMG', label: 'Danificada' },
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
        ? (vm.printings.find(p => p.id === hoveredPrintingId) ?? vm.selectedCard)
        : vm.selectedCard;

    const imageUrl =
        displayCard?.image_uris?.normal ?? displayCard?.card_faces?.[0]?.image_uris?.normal;

    const handleSave = async () => {
        const success = await vm.saveStockItem();
        if (success) {
            toast.success('Carta adicionada ao estoque', {
                description: `${displayCard?.name} foi cadastrada com sucesso.`,
            });
            onSuccess?.();
            onClose();
        } else if (vm.error) {
            toast.error('Erro ao cadastrar carta', { description: vm.error });
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
                        className={`rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 relative ${vm.isFoil ? 'foil-border' : ''}`}
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
                        {vm.isFoil && <FoilCardOverlay />}
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
                                onOpenChange={(open) => { if (!open) setHoveredPrintingId(null); }}
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
                                <SelectContent position="popper" className="min-w-max max-h-64">
                                    {vm.printings.map((p) => (
                                        <SelectItem
                                            key={p.id}
                                            value={p.id}
                                            className="text-[13px] cursor-pointer"
                                            onMouseEnter={() => setHoveredPrintingId(p.id)}
                                            onMouseLeave={() => setHoveredPrintingId(null)}
                                        >
                                            {p.set_name} #{p.collector_number}{' '}
                                            {p.prices?.usd ? `— $${p.prices.usd}` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <p className="text-sm text-text-muted">{displayCard?.set_name}</p>
                        )}
                    </SheetHeader>

                    <div className="h-px bg-border-subtle" />

                    {/* Foil toggle */}
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                                Versao Foil
                            </span>
                            {vm.isFoil && vm.selectedCard?.prices?.usd_foil && (
                                <p className="text-[11px] text-text-muted mt-0.5">
                                    Preco foil: ${vm.selectedCard.prices.usd_foil}
                                </p>
                            )}
                        </div>
                        <FoilToggleButton active={vm.isFoil} onClick={() => vm.setIsFoil(!vm.isFoil)} />
                    </div>

                    <div className="h-px bg-border-subtle" />

                    {/* Dados financeiros */}
                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="price-drawer"
                                    className="text-xs font-semibold text-text-muted uppercase tracking-wider"
                                >
                                    Preco Pago
                                </Label>
                                <button
                                    type="button"
                                    onClick={() => vm.setUseScryfall(!vm.useScryfall)}
                                    className={`flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-md border transition-all ${
                                        vm.useScryfall
                                            ? 'bg-primary/10 border-primary/40 text-primary'
                                            : 'bg-bg-elevated border-border-subtle text-text-muted hover:text-text-secondary'
                                    }`}
                                    title="Usar cotacao de mercado do Scryfall"
                                >
                                    <RefreshCw className="h-3 w-3" />
                                    Cotacao Scryfall
                                </button>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-muted">
                                    {vm.priceCurrency === 'USD' ? (
                                        <DollarSign className="h-4 w-4 shrink-0" />
                                    ) : (
                                        <span className="text-xs font-bold shrink-0">R$</span>
                                    )}
                                </div>
                                <Input
                                    id="price-drawer"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={vm.price}
                                    onChange={(e) => vm.setPrice(e.target.value)}
                                    placeholder="0.00"
                                    readOnly={vm.useScryfall}
                                    className={`pl-9 h-10 border-border-subtle font-mono text-text-primary ${
                                        vm.useScryfall
                                            ? 'bg-bg-muted/40 text-text-muted cursor-default'
                                            : 'bg-bg-elevated'
                                    }`}
                                />
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                        vm.priceCurrency === 'USD'
                                            ? 'bg-blue-500/20 text-blue-400'
                                            : 'bg-emerald-500/20 text-emerald-400'
                                    }`}>
                                        {vm.priceCurrency}
                                    </span>
                                </div>
                            </div>
                            {vm.useScryfall && (
                                <p className="text-[11px] text-text-muted">
                                    Cotacao de mercado do Scryfall. Desative para inserir o preco pago em R$.
                                </p>
                            )}
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
                                    onChange={(e) => vm.setQuantity(e.target.value)}
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
