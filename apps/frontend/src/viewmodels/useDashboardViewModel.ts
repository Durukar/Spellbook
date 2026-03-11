import { useState, useEffect } from 'react';
import { scryfallService } from '@/services/scryfallService';
import { apiService } from '@/services/apiService';
import type { SaleStats } from '@/types/sale';

export interface SetsByYear {
    year: string;
    cards: number;
    sets: number;
}

export interface ExpansionChartEntry {
    name: string;
    cards: number;
}

export interface DashboardStats {
    totalSets: number;
    totalCardsInCatalog: number;
    latestExpansionName: string;
    recentExpansionChartData: ExpansionChartEntry[];
    setsByYear: SetsByYear[];
    collectionCount: number;
    collectionValue: number;
}

export function useDashboardViewModel() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [saleStats, setSaleStats] = useState<SaleStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const [setList, saleStatsData] = await Promise.allSettled([
                    scryfallService.getSets(),
                    apiService.getSaleStats(),
                ]);

                if (saleStatsData.status === 'fulfilled') {
                    setSaleStats(saleStatsData.value);
                }

                if (setList.status === 'rejected') {
                    throw new Error('Falha ao carregar dados do catalogo Scryfall.');
                }

                const allSets = setList.value.data;

                const recentExpansions = allSets
                    .filter((s) => !s.digital && s.set_type === 'expansion')
                    .sort((a, b) => b.released_at.localeCompare(a.released_at))
                    .slice(0, 7);

                const yearMap = new Map<string, { sets: number; cards: number }>();
                allSets.forEach((s) => {
                    if (!s.released_at || s.digital) return;
                    const year = s.released_at.substring(0, 4);
                    const current = yearMap.get(year) ?? { sets: 0, cards: 0 };
                    yearMap.set(year, {
                        sets: current.sets + 1,
                        cards: current.cards + s.card_count,
                    });
                });

                const setsByYear: SetsByYear[] = Array.from(yearMap.entries())
                    .map(([year, data]) => ({ year, ...data }))
                    .sort((a, b) => a.year.localeCompare(b.year))
                    .slice(-10);

                const totalCardsInCatalog = allSets.reduce(
                    (sum, s) => sum + s.card_count,
                    0,
                );

                const recentExpansionChartData: ExpansionChartEntry[] = recentExpansions.map((s) => ({
                    name: s.code.toUpperCase(),
                    cards: s.card_count,
                }));

                setStats({
                    totalSets: allSets.length,
                    totalCardsInCatalog,
                    latestExpansionName: recentExpansions[0]?.name ?? 'N/A',
                    recentExpansionChartData,
                    setsByYear,
                    collectionCount: 0,
                    collectionValue: 0,
                });
            } catch {
                setError('Falha ao carregar dados do catalogo Scryfall.');
            } finally {
                setIsLoading(false);
            }
        }

        load();
    }, []);

    return { stats, saleStats, isLoading, error };
}
