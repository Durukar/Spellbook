import { useState, useCallback } from 'react';
import { apiService } from '@/services/apiService';
import type { ScryfallCard } from '@/types/scryfall';

export interface CardSearchViewModel {
    query: string;
    results: ScryfallCard[];
    isLoading: boolean;
    error: string | null;
    hasMore: boolean;
    totalCards: number;
    currentPage: number;
    search: (query: string) => Promise<void>;
    loadMore: () => Promise<void>;
    reset: () => void;
}

export function useCardSearchViewModel(): CardSearchViewModel {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ScryfallCard[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [totalCards, setTotalCards] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    const search = useCallback(async (newQuery: string) => {
        if (!newQuery.trim()) return;

        setQuery(newQuery);
        setIsLoading(true);
        setError(null);
        setResults([]);
        setCurrentPage(1);

        try {
            const data = await apiService.searchCards(newQuery, 1);
            setResults(data.data);
            setHasMore(data.has_more);
            setTotalCards(data.total_cards);
        } catch {
            setError('Erro ao buscar cartas. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadMore = useCallback(async () => {
        if (!hasMore || isLoading) return;

        const nextPage = currentPage + 1;
        setIsLoading(true);

        try {
            const data = await apiService.searchCards(query, nextPage);
            setResults((prev) => [...prev, ...data.data]);
            setHasMore(data.has_more);
            setCurrentPage(nextPage);
        } catch {
            setError('Erro ao carregar mais cartas.');
        } finally {
            setIsLoading(false);
        }
    }, [hasMore, isLoading, currentPage, query]);

    const reset = useCallback(() => {
        setQuery('');
        setResults([]);
        setIsLoading(false);
        setError(null);
        setHasMore(false);
        setTotalCards(0);
        setCurrentPage(1);
    }, []);

    return {
        query,
        results,
        isLoading,
        error,
        hasMore,
        totalCards,
        currentPage,
        search,
        loadMore,
        reset,
    };
}
