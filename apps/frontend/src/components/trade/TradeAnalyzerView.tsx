import { useEffect, useRef } from 'react'
import { X, Search, ArrowLeftRight, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useTradeAnalyzerViewModel, type TradeSide, type TradeCard } from '@/viewmodels/useTradeAnalyzerViewModel'
import type { ScryfallCard } from '@/types/scryfall'

function TradeSidePanel({
    side,
    cards,
    total,
    search,
    results,
    isSearching,
    onSearch,
    onAdd,
    onRemove,
    isWinner,
    isLoser,
}: {
    side: TradeSide
    cards: TradeCard[]
    total: number
    search: string
    results: ScryfallCard[]
    isSearching: boolean
    onSearch: (q: string) => void
    onAdd: (card: ScryfallCard) => void
    onRemove: (id: string) => void
    isWinner: boolean
    isLoser: boolean
}) {
    const searchRef = useRef<HTMLDivElement>(null)

    const borderColor = isWinner
        ? 'border-emerald-500/40'
        : isLoser
        ? 'border-red-500/30'
        : 'border-border-subtle'

    const totalColor = isWinner
        ? 'text-emerald-400'
        : isLoser
        ? 'text-red-400'
        : 'text-text-primary'

    return (
        <div className={`flex flex-col flex-1 min-w-0 border rounded-2xl bg-bg-elevated overflow-hidden transition-colors ${borderColor}`}>
            <div className="px-4 py-3 border-b border-border-subtle">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Lado {side}</span>
                    <span className={`text-xl font-bold ${totalColor}`}>
                        ${total.toFixed(2)}
                    </span>
                </div>
            </div>

            <div className="px-4 py-3 border-b border-border-subtle relative" ref={searchRef}>
                <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                    <Input
                        value={search}
                        onChange={(e) => onSearch(e.target.value)}
                        placeholder="Buscar carta..."
                        className="pl-8 h-8 bg-bg-muted border-border-subtle text-text-primary text-sm"
                    />
                </div>
                {results.length > 0 && (
                    <div className="absolute left-4 right-4 top-full mt-1 bg-bg-elevated border border-border-subtle rounded-xl shadow-2xl z-50 overflow-hidden">
                        {isSearching ? (
                            <div className="px-3 py-2 text-xs text-text-muted">Buscando...</div>
                        ) : (
                            results.map((card) => {
                                const price = card.prices?.usd ?? card.prices?.usd_foil
                                return (
                                    <button
                                        key={card.id}
                                        onClick={() => onAdd(card)}
                                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-bg-muted transition-colors text-left"
                                    >
                                        <div className="w-7 shrink-0 rounded overflow-hidden" style={{ aspectRatio: '2.5/3.5' }}>
                                            {(card.image_uris?.normal ?? card.card_faces?.[0]?.image_uris?.normal) && (
                                                <img
                                                    src={card.image_uris?.normal ?? card.card_faces?.[0]?.image_uris?.normal}
                                                    alt={card.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-text-primary truncate">{card.name}</p>
                                            <p className="text-xs text-text-muted truncate">{card.set_name}</p>
                                        </div>
                                        {price && (
                                            <span className="text-xs font-semibold text-text-secondary shrink-0">${price}</span>
                                        )}
                                    </button>
                                )
                            })
                        )}
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {cards.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-text-muted text-sm">
                        Busque e adicione cartas
                    </div>
                ) : (
                    cards.map((card) => (
                        <div
                            key={card.id}
                            className="flex items-center gap-2 bg-bg-muted/50 rounded-lg p-2 border border-border-subtle"
                        >
                            <div className="w-8 shrink-0 rounded overflow-hidden" style={{ aspectRatio: '2.5/3.5' }}>
                                {card.image_url ? (
                                    <img src={card.image_url} alt={card.name} className="w-full h-full object-cover" />
                                ) : <div className="w-full h-full bg-bg-muted" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-text-primary truncate">{card.name}</p>
                                <p className="text-xs text-text-muted truncate">{card.set_name}</p>
                            </div>
                            <span className="text-sm font-semibold text-text-secondary shrink-0">
                                ${card.price_usd.toFixed(2)}
                            </span>
                            <button
                                onClick={() => onRemove(card.id)}
                                className="text-text-muted hover:text-red-400 transition-colors shrink-0"
                            >
                                <X size={13} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export function TradeAnalyzerView() {
    const vm = useTradeAnalyzerViewModel()

    useEffect(() => {
        vm.loadBuyers()
    }, [])

    const diffAbs = Math.abs(vm.difference)
    const diffPct = Math.abs(vm.differencePercent)

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="px-6 py-5 border-b border-border-subtle shrink-0 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Trade Analyzer</h1>
                    <p className="text-sm text-text-muted mt-1">Compare o valor de duas trocas</p>
                </div>
                <Button variant="ghost" size="sm" onClick={vm.reset} className="text-text-muted">
                    Limpar
                </Button>
            </div>

            <div className="flex flex-1 overflow-hidden gap-4 p-6">
                <TradeSidePanel
                    side="A"
                    cards={vm.sideA}
                    total={vm.totalA}
                    search={vm.searchA}
                    results={vm.resultsA}
                    isSearching={vm.isSearchingA}
                    onSearch={(q) => vm.searchCards('A', q)}
                    onAdd={(c) => vm.addToSide('A', c)}
                    onRemove={(id) => vm.removeFromSide('A', id)}
                    isWinner={vm.winner === 'A'}
                    isLoser={vm.winner === 'B'}
                />

                <div className="flex flex-col items-center justify-center gap-4 shrink-0 w-40">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-bg-elevated border border-border-subtle">
                        <ArrowLeftRight size={16} className="text-text-muted" />
                    </div>

                    {vm.winner !== 'equal' && (vm.sideA.length > 0 || vm.sideB.length > 0) && (
                        <div className="text-center">
                            <p className="text-xs text-text-muted">Diferenca</p>
                            <p className={`text-lg font-bold ${vm.winner === 'A' ? 'text-emerald-400' : 'text-red-400'}`}>
                                ${diffAbs.toFixed(2)}
                            </p>
                            <p className={`text-xs font-semibold ${vm.winner === 'A' ? 'text-emerald-400' : 'text-red-400'}`}>
                                {diffPct.toFixed(0)}%
                            </p>
                            <p className="text-xs text-text-muted mt-1">
                                Lado {vm.winner} ganha
                            </p>
                        </div>
                    )}

                    {vm.winner === 'equal' && vm.sideA.length > 0 && (
                        <div className="text-center">
                            <p className="text-sm font-bold text-text-primary">Troca justa</p>
                        </div>
                    )}
                </div>

                <TradeSidePanel
                    side="B"
                    cards={vm.sideB}
                    total={vm.totalB}
                    search={vm.searchB}
                    results={vm.resultsB}
                    isSearching={vm.isSearchingB}
                    onSearch={(q) => vm.searchCards('B', q)}
                    onAdd={(c) => vm.addToSide('B', c)}
                    onRemove={(id) => vm.removeFromSide('B', id)}
                    isWinner={vm.winner === 'B'}
                    isLoser={vm.winner === 'A'}
                />
            </div>

            <div className="px-6 py-4 border-t border-border-subtle shrink-0">
                <div className="flex items-center gap-3">
                    <User size={14} className="text-text-muted shrink-0" />
                    <span className="text-sm text-text-muted shrink-0">Parceiro da troca:</span>
                    <Select
                        value={vm.partnerBuyerId ?? ''}
                        onValueChange={(v) => vm.selectPartner(v || null)}
                    >
                        <SelectTrigger className="h-8 text-sm bg-bg-elevated border-border-subtle text-text-primary max-w-xs">
                            <SelectValue placeholder="Selecionar comprador..." />
                        </SelectTrigger>
                        <SelectContent>
                            {vm.buyers.map((b) => (
                                <SelectItem key={b.id} value={b.id}>
                                    {b.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {vm.partnerBuyer && (
                        <div className="flex items-center gap-3 ml-2">
                            {vm.partnerBuyer.phone && (
                                <span className="text-xs text-text-muted">{vm.partnerBuyer.phone}</span>
                            )}
                            {vm.partnerBuyer.notes && (
                                <span className="text-xs text-yellow-400/80 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded">
                                    {vm.partnerBuyer.notes}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
