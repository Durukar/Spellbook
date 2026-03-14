const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutos

interface CacheEntry {
    rate: number;
    timestamp: number;
}

let cache: CacheEntry | null = null;

export const currencyService = {
    async getUsdToBrl(): Promise<number> {
        if (cache && Date.now() - cache.timestamp < CACHE_DURATION_MS) {
            return cache.rate;
        }

        const response = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL');
        if (!response.ok) throw new Error('Falha ao buscar cotacao USD/BRL');

        const data = await response.json();
        const rate = parseFloat(data.USDBRL.bid);

        cache = { rate, timestamp: Date.now() };
        return rate;
    },
};
