import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TransactionDashboard } from '@/components/dashboard/TransactionDashboard';
import { apiService } from '@/services/apiService';

vi.mock('@/services/apiService', () => ({
    apiService: {
        getSaleStats: vi.fn(),
        listStockItems: vi.fn(),
        listSales: vi.fn(),
        listBuyers: vi.fn(),
    },
}));

import type { BackendStockItem } from '@/types/stock';
import type { SaleStats } from '@/types/sale';

const mockStockItems: BackendStockItem[] = [
    {
        id: '1',
        scryfall_id: 'abc',
        card_name: 'Ragavan, Nimble Pilferer',
        set_name: 'Modern Horizons 2',
        image_url: 'https://example.com/ragavan.jpg',
        purchase_price: 380,
        purchase_date: '2024-01-15',
        condition: 'NM',
        quantity: 1,
        is_foil: false,
        created_at: '2024-01-15',
    },
    {
        id: '2',
        scryfall_id: 'def',
        card_name: 'Wrenn and Six',
        set_name: 'Modern Horizons 2',
        image_url: 'https://example.com/wrenn.jpg',
        purchase_price: 240,
        purchase_date: '2024-02-10',
        condition: 'NM',
        quantity: 1,
        is_foil: false,
        created_at: '2024-02-10',
    },
];

const mockSaleStats: SaleStats = {
    total_revenue: 500,
    total_cost: 300,
    total_profit: 100,
    total_discount: 20,
    sales_count: 3,
    stock_value: 620,
    monthly_revenue: 200,
    monthly_profit: 50,
    monthly_discount: 5,
    monthly_count: 1,
};

describe('TransactionDashboard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(apiService.getSaleStats).mockResolvedValue(mockSaleStats);
        vi.mocked(apiService.listStockItems).mockResolvedValue(mockStockItems);
        vi.mocked(apiService.listSales).mockResolvedValue([]);
        vi.mocked(apiService.listBuyers).mockResolvedValue([]);
    });

    it('renders the Dashboard heading', () => {
        render(<TransactionDashboard />);
        expect(screen.getByRole('heading', { name: /dashboard/i })).toBeDefined();
    });

    it('shows loading state initially', () => {
        vi.mocked(apiService.listStockItems).mockReturnValue(new Promise(() => {}));
        render(<TransactionDashboard />);
        expect(screen.getByText(/carregando/i)).toBeDefined();
    });

    it('renders My Collection section after data loads', async () => {
        render(<TransactionDashboard />);
        await waitFor(() => expect(screen.getByText('Minha Colecao')).toBeDefined());
    });

    it('renders Evolucao do Patrimonio section after data loads', async () => {
        render(<TransactionDashboard />);
        await waitFor(() => expect(screen.getByText('Evolucao do Patrimonio')).toBeDefined());
    });

    it('renders Top Cartas do Estoque section after data loads', async () => {
        render(<TransactionDashboard />);
        await waitFor(() => expect(screen.getByText('Top Cartas do Estoque')).toBeDefined());
    });

    it('renders a card name in top cards section', async () => {
        render(<TransactionDashboard />);
        await waitFor(() =>
            expect(screen.getByText('Ragavan, Nimble Pilferer')).toBeDefined(),
        );
    });

    it('renders Add Card button', () => {
        render(<TransactionDashboard />);
        expect(screen.getByRole('button', { name: /adicionar carta/i })).toBeDefined();
    });

    it('shows error message when stock API fails', async () => {
        vi.mocked(apiService.listStockItems).mockRejectedValue(new Error('Network error'));
        render(<TransactionDashboard />);
        await waitFor(() => expect(screen.getByText(/falha/i)).toBeDefined());
    });

    it('renders the search input for cards', () => {
        render(<TransactionDashboard />);
        expect(screen.getByPlaceholderText(/buscar cartas/i)).toBeDefined();
    });

    it('renders Color Distribution label after data loads', async () => {
        render(<TransactionDashboard />);
        await waitFor(() => expect(screen.getByText('Distribuicao por Cor')).toBeDefined());
    });

    it('renders Start Collecting button when collection is empty', async () => {
        vi.mocked(apiService.listStockItems).mockResolvedValue([]);
        render(<TransactionDashboard />);
        await waitFor(() =>
            expect(screen.getByRole('button', { name: /comecar a colecionar/i })).toBeDefined(),
        );
    });

    it('renders the subtitle for the dashboard', () => {
        render(<TransactionDashboard />);
        expect(
            screen.getByText(/visao geral da sua colecao magic/i),
        ).toBeDefined();
    });
});
