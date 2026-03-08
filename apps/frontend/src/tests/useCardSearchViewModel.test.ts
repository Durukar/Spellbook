import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCardSearchViewModel } from '@/viewmodels/useCardSearchViewModel';
import { apiService } from '@/services/apiService';
import type { ScryfallCard } from '@/types/scryfall';

vi.mock('@/services/apiService', () => ({
    apiService: {
        searchCards: vi.fn(),
    },
}));

const mockCard = (id: string, name: string): ScryfallCard => ({
    object: 'card',
    id,
    name,
    set: 'lea',
    set_name: 'Limited Edition Alpha',
    collector_number: '1',
    rarity: 'common',
    prices: { usd: '1.00', usd_foil: null, eur: null, eur_foil: null },
    released_at: '1993-08-05',
    lang: 'en',
});

const page1Cards = [mockCard('1', 'Lightning Bolt'), mockCard('2', 'Lightning Strike')];
const page2Cards = [mockCard('3', 'Lightning Helix')];

describe('useCardSearchViewModel', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('estado inicial', () => {
        it('inicia com resultados vazios', () => {
            const { result } = renderHook(() => useCardSearchViewModel());
            expect(result.current.results).toEqual([]);
        });

        it('inicia sem estar carregando', () => {
            const { result } = renderHook(() => useCardSearchViewModel());
            expect(result.current.isLoading).toBe(false);
        });

        it('inicia sem erro', () => {
            const { result } = renderHook(() => useCardSearchViewModel());
            expect(result.current.error).toBeNull();
        });

        it('inicia com query vazia', () => {
            const { result } = renderHook(() => useCardSearchViewModel());
            expect(result.current.query).toBe('');
        });

        it('inicia sem mais paginas', () => {
            const { result } = renderHook(() => useCardSearchViewModel());
            expect(result.current.hasMore).toBe(false);
        });

        it('inicia com total de cartas zero', () => {
            const { result } = renderHook(() => useCardSearchViewModel());
            expect(result.current.totalCards).toBe(0);
        });

        it('inicia na pagina 1', () => {
            const { result } = renderHook(() => useCardSearchViewModel());
            expect(result.current.currentPage).toBe(1);
        });
    });

    describe('search', () => {
        it('atualiza a query e os resultados apos busca bem-sucedida', async () => {
            vi.mocked(apiService.searchCards).mockResolvedValueOnce({
                object: 'list',
                has_more: false,
                total_cards: 2,
                data: page1Cards,
            });

            const { result } = renderHook(() => useCardSearchViewModel());

            await act(async () => {
                await result.current.search('lightning');
            });

            expect(result.current.query).toBe('lightning');
            expect(result.current.results).toEqual(page1Cards);
            expect(result.current.totalCards).toBe(2);
        });

        it('chama searchCards na pagina 1 ao buscar', async () => {
            vi.mocked(apiService.searchCards).mockResolvedValueOnce({
                object: 'list',
                has_more: false,
                total_cards: 1,
                data: page1Cards,
            });

            const { result } = renderHook(() => useCardSearchViewModel());

            await act(async () => {
                await result.current.search('bolt');
            });

            expect(apiService.searchCards).toHaveBeenCalledWith('bolt', 1);
        });

        it('define hasMore quando a API indica mais paginas', async () => {
            vi.mocked(apiService.searchCards).mockResolvedValueOnce({
                object: 'list',
                has_more: true,
                total_cards: 100,
                data: page1Cards,
            });

            const { result } = renderHook(() => useCardSearchViewModel());

            await act(async () => {
                await result.current.search('lightning');
            });

            expect(result.current.hasMore).toBe(true);
        });

        it('reseta os resultados anteriores ao iniciar nova busca', async () => {
            vi.mocked(apiService.searchCards)
                .mockResolvedValueOnce({
                    object: 'list',
                    has_more: false,
                    total_cards: 2,
                    data: page1Cards,
                })
                .mockResolvedValueOnce({
                    object: 'list',
                    has_more: false,
                    total_cards: 1,
                    data: page2Cards,
                });

            const { result } = renderHook(() => useCardSearchViewModel());

            await act(async () => {
                await result.current.search('lightning');
            });

            await act(async () => {
                await result.current.search('helix');
            });

            expect(result.current.results).toEqual(page2Cards);
        });

        it('nao chama a API quando a query esta vazia', async () => {
            const { result } = renderHook(() => useCardSearchViewModel());

            await act(async () => {
                await result.current.search('');
            });

            expect(apiService.searchCards).not.toHaveBeenCalled();
        });

        it('nao chama a API quando a query e so espacos', async () => {
            const { result } = renderHook(() => useCardSearchViewModel());

            await act(async () => {
                await result.current.search('   ');
            });

            expect(apiService.searchCards).not.toHaveBeenCalled();
        });

        it('define erro quando a API falha', async () => {
            vi.mocked(apiService.searchCards).mockRejectedValueOnce(
                new Error('Scryfall API error: 503'),
            );

            const { result } = renderHook(() => useCardSearchViewModel());

            await act(async () => {
                await result.current.search('bolt');
            });

            expect(result.current.error).not.toBeNull();
            expect(result.current.results).toEqual([]);
        });

        it('limpa o erro ao iniciar nova busca', async () => {
            vi.mocked(apiService.searchCards)
                .mockRejectedValueOnce(new Error('Scryfall API error: 503'))
                .mockResolvedValueOnce({
                    object: 'list',
                    has_more: false,
                    total_cards: 1,
                    data: page1Cards,
                });

            const { result } = renderHook(() => useCardSearchViewModel());

            await act(async () => {
                await result.current.search('bolt');
            });

            expect(result.current.error).not.toBeNull();

            await act(async () => {
                await result.current.search('lightning');
            });

            expect(result.current.error).toBeNull();
        });

        it('nao esta carregando apos a busca terminar', async () => {
            vi.mocked(apiService.searchCards).mockResolvedValueOnce({
                object: 'list',
                has_more: false,
                total_cards: 1,
                data: page1Cards,
            });

            const { result } = renderHook(() => useCardSearchViewModel());

            await act(async () => {
                await result.current.search('lightning');
            });

            expect(result.current.isLoading).toBe(false);
        });
    });

    describe('loadMore', () => {
        it('acrescenta resultados da proxima pagina', async () => {
            vi.mocked(apiService.searchCards)
                .mockResolvedValueOnce({
                    object: 'list',
                    has_more: true,
                    total_cards: 3,
                    data: page1Cards,
                })
                .mockResolvedValueOnce({
                    object: 'list',
                    has_more: false,
                    total_cards: 3,
                    data: page2Cards,
                });

            const { result } = renderHook(() => useCardSearchViewModel());

            await act(async () => {
                await result.current.search('lightning');
            });

            await act(async () => {
                await result.current.loadMore();
            });

            expect(result.current.results).toEqual([...page1Cards, ...page2Cards]);
            expect(result.current.currentPage).toBe(2);
        });

        it('nao faz nada quando nao ha mais paginas', async () => {
            vi.mocked(apiService.searchCards).mockResolvedValueOnce({
                object: 'list',
                has_more: false,
                total_cards: 2,
                data: page1Cards,
            });

            const { result } = renderHook(() => useCardSearchViewModel());

            await act(async () => {
                await result.current.search('lightning');
            });

            await act(async () => {
                await result.current.loadMore();
            });

            expect(apiService.searchCards).toHaveBeenCalledTimes(1);
        });

        it('chama searchCards com a pagina correta e a query atual', async () => {
            vi.mocked(apiService.searchCards)
                .mockResolvedValueOnce({
                    object: 'list',
                    has_more: true,
                    total_cards: 3,
                    data: page1Cards,
                })
                .mockResolvedValueOnce({
                    object: 'list',
                    has_more: false,
                    total_cards: 3,
                    data: page2Cards,
                });

            const { result } = renderHook(() => useCardSearchViewModel());

            await act(async () => {
                await result.current.search('lightning');
            });

            await act(async () => {
                await result.current.loadMore();
            });

            expect(apiService.searchCards).toHaveBeenNthCalledWith(2, 'lightning', 2);
        });
    });

    describe('reset', () => {
        it('limpa todos os estados', async () => {
            vi.mocked(apiService.searchCards).mockResolvedValueOnce({
                object: 'list',
                has_more: true,
                total_cards: 10,
                data: page1Cards,
            });

            const { result } = renderHook(() => useCardSearchViewModel());

            await act(async () => {
                await result.current.search('lightning');
            });

            act(() => {
                result.current.reset();
            });

            expect(result.current.query).toBe('');
            expect(result.current.results).toEqual([]);
            expect(result.current.isLoading).toBe(false);
            expect(result.current.error).toBeNull();
            expect(result.current.hasMore).toBe(false);
            expect(result.current.totalCards).toBe(0);
            expect(result.current.currentPage).toBe(1);
        });
    });
});
