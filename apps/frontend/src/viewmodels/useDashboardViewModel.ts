import { useState, useEffect } from 'react';
import { apiService } from '@/services/apiService';
import type { SaleStats, BackendSale } from '@/types/sale';
import type { BackendStockItem } from '@/types/stock';

export interface PatrimonioEntry {
    month: string;
    valor: number;
}

export interface ConditionDistribution {
    condition: string;
    count: number;
    percentage: number;
    color: string;
}

export interface DashboardStats {
    patrimonioData: PatrimonioEntry[];
    collectionCount: number;
    collectionValueBRL: number;
    foilPercentage: number;
    conditionDistribution: ConditionDistribution[];
    topCards: BackendStockItem[];
    buyersCount: number;
    recentSales: BackendSale[];
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
                const [saleStatsData, stockData, salesData, buyersData] = await Promise.allSettled([
                    apiService.getSaleStats(),
                    apiService.listStockItems(),
                    apiService.listSales(),
                    apiService.listBuyers(),
                ]);

                if (saleStatsData.status === 'fulfilled') {
                    setSaleStats(saleStatsData.value);
                }

                if (stockData.status === 'rejected') {
                    throw new Error('Falha ao carregar dados do estoque.');
                }

                const stockItems = stockData.value;

                const collectionCount = stockItems.reduce((sum, item) => sum + item.quantity, 0);
                const collectionValueBRL = stockItems.reduce(
                    (sum, item) => sum + item.purchase_price * item.quantity,
                    0
                );

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
                    .sort((a, b) => b.purchase_price * b.quantity - a.purchase_price * a.quantity)
                    .slice(0, 6);

                const monthMap = new Map<string, number>();
                stockItems.forEach((item) => {
                    const d = new Date(item.purchase_date);
                    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                    monthMap.set(key, (monthMap.get(key) ?? 0) + item.purchase_price * item.quantity);
                });
                let cumulative = 0;
                const patrimonioData: PatrimonioEntry[] = Array.from(monthMap.entries())
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([key]) => {
                        const [year, month] = key.split('-');
                        cumulative += monthMap.get(key)!;
                        const label = new Date(Number(year), Number(month) - 1, 1)
                            .toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
                        return { month: label, valor: cumulative };
                    });

                const buyersCount = buyersData.status === 'fulfilled' ? buyersData.value.length : 0;

                const recentSales: BackendSale[] =
                    salesData.status === 'fulfilled' ? salesData.value.slice(0, 6) : [];

                setStats({
                    patrimonioData,
                    collectionCount,
                    collectionValueBRL,
                    foilPercentage,
                    conditionDistribution,
                    topCards,
                    buyersCount,
                    recentSales,
                });
            } catch {
                setError('Falha ao carregar dados do estoque.');
            } finally {
                setIsLoading(false);
            }
        }

        load();
    }, [refreshKey]);

    return { stats, saleStats, isLoading, error, refresh };
}
