import { useState, useRef, useCallback } from 'react';
import { Search, X, ChevronDown, AlertCircle, SearchX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CardItem } from './CardItem';
import { useCardSearchViewModel } from '@/viewmodels/useCardSearchViewModel';

function CardSkeleton() {
    return (
        <div className="flex flex-col rounded-xl border border-border overflow-hidden">
            <Skeleton className="aspect-[2.5/3.5] w-full" />
            <div className="p-3 flex flex-col gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
    );
}

export function CardSearchView() {
    const vm = useCardSearchViewModel();
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSearch = useCallback(async () => {
        const q = inputValue.trim();
        if (!q) return;
        await vm.search(q);
    }, [inputValue, vm]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter') handleSearch();
        },
        [handleSearch],
    );

    const handleClear = useCallback(() => {
        setInputValue('');
        vm.reset();
        inputRef.current?.focus();
    }, [vm]);

    const hasResults = vm.results.length > 0;
    const isEmpty = !vm.isLoading && vm.query && !hasResults && !vm.error;

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="shrink-0 px-6 pt-6 pb-4 border-b border-border">
                <div className="mb-4">
                    <h1 className="text-2xl font-bold text-foreground">Buscar Cartas</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Pesquise no catalogo do Scryfall via backend
                    </p>
                </div>

                {/* Search input */}
                <div className="flex gap-2 max-w-2xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            ref={inputRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Nome da carta, e.g. Lightning Bolt..."
                            className="pl-9 pr-9 bg-muted/40 border-border focus-visible:ring-primary"
                        />
                        {inputValue && (
                            <button
                                onClick={handleClear}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                    <Button onClick={handleSearch} disabled={vm.isLoading || !inputValue.trim()}>
                        {vm.isLoading && !hasResults ? 'Buscando...' : 'Buscar'}
                    </Button>
                </div>

                {/* Results count */}
                <AnimatePresence>
                    {hasResults && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-xs text-muted-foreground mt-2"
                        >
                            {vm.totalCards.toLocaleString('pt-BR')} cartas encontradas para
                            &ldquo;{vm.query}&rdquo;
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
                {/* Error */}
                {vm.error && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive max-w-md">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p className="text-sm">{vm.error}</p>
                    </div>
                )}

                {/* Empty state */}
                {isEmpty && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <SearchX className="w-12 h-12 text-muted-foreground/40 mb-4" />
                        <p className="text-muted-foreground font-medium">Nenhuma carta encontrada</p>
                        <p className="text-sm text-muted-foreground/60 mt-1">
                            Tente um termo diferente ou verifique a ortografia
                        </p>
                    </div>
                )}

                {/* Initial state */}
                {!vm.query && !vm.isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Search className="w-12 h-12 text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground">Digite o nome de uma carta para comecar</p>
                    </div>
                )}

                {/* Card grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3">
                    {vm.results.map((card) => (
                        <CardItem key={card.id} card={card} />
                    ))}

                    {/* Loading skeletons */}
                    {vm.isLoading &&
                        Array.from({ length: 12 }).map((_, i) => (
                            <CardSkeleton key={`skeleton-${i}`} />
                        ))}
                </div>

                {/* Load more */}
                {vm.hasMore && !vm.isLoading && (
                    <div className="flex justify-center mt-6">
                        <Button
                            variant="outline"
                            onClick={() => vm.loadMore()}
                            className="gap-2"
                        >
                            <ChevronDown className="w-4 h-4" />
                            Carregar mais
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
