import { useState, useEffect } from 'react';
import { scryfallService } from '@/services/scryfallService';
import { apiService } from '@/services/apiService';
import { currencyService } from '@/services/currencyService';
import type { SaleStats, BackendSale } from '@/types/sale';
import type { BackendStockItem } from '@/types/stock';

export interface SetsByYear {
    year: string;
    cards: number;
    sets: number;
}

export interface ExpansionChartEntry {
    name: string;
    cards: number;
}

export interface ConditionDistribution {
    condition: string;
    count: number;
    percentage: number;
    color: string;
}

export interface DashboardStats {
    totalSets: number;
    totalCardsInCatalog: number;
    latestExpansionName: string;
    recentExpansionChartData: ExpansionChartEntry[];
    setsByYear: SetsByYear[];
    collectionCount: number;
    collectionValueBRL: number;
    foilPercentage: number;
    conditionDistribution: ConditionDistribution[];
    topCards: BackendStockItem[];
    buyersCount: number;
    recentSales: BackendSale[];
    usdToBrlRate: number;
}

const CONDITION_COLORS: Record<string, string> = {
    NM: '#10b981',
    SP: '#3b82f6',
    MP: '#eab308',
    HP: '#f97316',
    DMG: '#ef4444',
};

export function useDashboardViewModel() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [saleStats, setSaleStats] = useState<SaleStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const refresh = () => setRefreshKey((k) => k + 1);

    useEffect(() => {
        async function load() {
            try {
                const [setList, saleStatsData, stockData, salesData, buyersData, usdRateResult] = await Promise.allSettled([
                    scryfallService.getSets(),
                    apiService.getSaleStats(),
                    apiService.listStockItems(),
                    apiService.listSales(),
                    apiService.listBuyers(),
                    currencyService.getUsdToBrl(),
                ]);

                if (saleStatsData.status === 'fulfilled') {
                    setSaleStats(saleStatsData.value);
                }

                if (setList.status === 'rejected') {
                    throw new Error('Falha ao carregar dados do catalogo Scryfall.');
                }

                const usdToBrlRate = usdRateResult.status === 'fulfilled' ? usdRateResult.value : 5.80;

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

                const totalCardsInCatalog = allSets.reduce((sum, s) => sum + s.card_count, 0);

                const recentExpansionChartData: ExpansionChartEntry[] = recentExpansions.map((s) => ({
                    name: s.code.toUpperCase(),
                    cards: s.card_count,
                }));

                // Dados reais do estoque — converte USD para BRL
                const stockItems = stockData.status === 'fulfilled' ? stockData.value : [];
                const collectionCount = stockItems.reduce((sum, item) => sum + item.quantity, 0);
                const collectionValueBRL = stockItems.reduce((sum, item) => {
                    const valueInBrl = item.price_currency === 'USD'
                        ? item.purchase_price * item.quantity * usdToBrlRate
                        : item.purchase_price * item.quantity;
                    return sum + valueInBrl;
                }, 0);

                const foilCount = stockItems
                    .filter((item) => item.is_foil)
                    .reduce((sum, item) => sum + item.quantity, 0);
                const foilPercentage =
                    collectionCount > 0 ? Math.round((foilCount / collectionCount) * 100) : 0;

                const conditionMap = new Map<string, number>();
                stockItems.forEach((item) => {
                    const current = conditionMap.get(item.condition) ?? 0;
                    conditionMap.set(item.condition, current + item.quantity);
                });
                const conditionDistribution: ConditionDistribution[] = ['NM', 'SP', 'MP', 'HP', 'DMG']
                    .filter((c) => conditionMap.has(c))
                    .map((c) => ({
                        condition: c,
                        count: conditionMap.get(c)!,
                        percentage:
                            collectionCount > 0
                                ? Math.round((conditionMap.get(c)! / collectionCount) * 100)
                                : 0,
                        color: CONDITION_COLORS[c] ?? '#6b7280',
                    }));

                const topCards = [...stockItems]
                    .sort((a, b) => b.purchase_price - a.purchase_price)
                    .slice(0, 5);

                const buyersCount = buyersData.status === 'fulfilled' ? buyersData.value.length : 0;

                const recentSales: BackendSale[] =
                    salesData.status === 'fulfilled' ? salesData.value.slice(0, 6) : [];

                setStats({
                    totalSets: allSets.length,
                    totalCardsInCatalog,
                    latestExpansionName: recentExpansions[0]?.name ?? 'N/A',
                    recentExpansionChartData,
                    setsByYear,
                    collectionCount,
                    collectionValueBRL,
                    foilPercentage,
                    conditionDistribution,
                    topCards,
                    buyersCount,
                    recentSales,
                    usdToBrlRate,
                });
            } catch {
                setError('Falha ao carregar dados do catalogo Scryfall.');
            } finally {
                setIsLoading(false);
            }
        }

        load();
    }, [refreshKey]);

    return { stats, saleStats, isLoading, error, refresh };
}
