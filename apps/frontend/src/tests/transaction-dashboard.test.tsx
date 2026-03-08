import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TransactionDashboard } from '@/components/dashboard/TransactionDashboard';
import { scryfallService } from '@/services/scryfallService';

vi.mock('@/services/scryfallService', () => ({
    scryfallService: {
        getSets: vi.fn(),
    },
}));

const mockSetsData = {
    object: 'list' as const,
    has_more: false,
    data: [
        {
            id: 'set-1',
            object: 'set' as const,
            code: 'otj',
            name: 'Outlaws of Thunder Junction',
            set_type: 'expansion',
            released_at: '2024-04-19',
            card_count: 276,
            digital: false,
            uri: '',
            scryfall_uri: '',
            search_uri: '',
            nonfoil_only: false,
            foil_only: false,
            icon_svg_uri: '',
        },
        {
            id: 'set-2',
            object: 'set' as const,
            code: 'mkm',
            name: 'Murders at Karlov Manor',
            set_type: 'expansion',
            released_at: '2024-02-09',
            card_count: 286,
            digital: false,
            uri: '',
            scryfall_uri: '',
            search_uri: '',
            nonfoil_only: false,
            foil_only: false,
            icon_svg_uri: '',
        },
    ],
};

describe('TransactionDashboard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the Dashboard heading', async () => {
        vi.mocked(scryfallService.getSets).mockResolvedValue(mockSetsData);
        render(<TransactionDashboard />);
        expect(screen.getByRole('heading', { name: /dashboard/i })).toBeDefined();
    });

    it('shows loading state initially', () => {
        vi.mocked(scryfallService.getSets).mockReturnValue(new Promise(() => {}));
        render(<TransactionDashboard />);
        expect(screen.getByText(/loading/i)).toBeDefined();
    });

    it('renders Collection Value label', async () => {
        vi.mocked(scryfallService.getSets).mockResolvedValue(mockSetsData);
        render(<TransactionDashboard />);
        expect(screen.getByText('Collection Value')).toBeDefined();
    });

    it('renders My Collection section after data loads', async () => {
        vi.mocked(scryfallService.getSets).mockResolvedValue(mockSetsData);
        render(<TransactionDashboard />);
        await waitFor(() => expect(screen.getByText('My Collection')).toBeDefined());
    });

    it('renders Card Catalog section after data loads', async () => {
        vi.mocked(scryfallService.getSets).mockResolvedValue(mockSetsData);
        render(<TransactionDashboard />);
        await waitFor(() => expect(screen.getByText('Card Catalog')).toBeDefined());
    });

    it('renders Recent Expansions section after data loads', async () => {
        vi.mocked(scryfallService.getSets).mockResolvedValue(mockSetsData);
        render(<TransactionDashboard />);
        await waitFor(() => expect(screen.getByText('Recent Expansions')).toBeDefined());
    });

    it('renders a set name from Scryfall data', async () => {
        vi.mocked(scryfallService.getSets).mockResolvedValue(mockSetsData);
        render(<TransactionDashboard />);
        await waitFor(() =>
            expect(screen.getByText('Outlaws of Thunder Junction')).toBeDefined(),
        );
    });

    it('renders Add Card button', () => {
        vi.mocked(scryfallService.getSets).mockResolvedValue(mockSetsData);
        render(<TransactionDashboard />);
        expect(screen.getByRole('button', { name: /add card/i })).toBeDefined();
    });

    it('shows error message when fetch fails', async () => {
        vi.mocked(scryfallService.getSets).mockRejectedValue(new Error('Network error'));
        render(<TransactionDashboard />);
        await waitFor(() => expect(screen.getByText(/failed to load/i)).toBeDefined());
    });

    it('renders the search input for cards', () => {
        vi.mocked(scryfallService.getSets).mockResolvedValue(mockSetsData);
        render(<TransactionDashboard />);
        expect(screen.getByPlaceholderText(/search cards/i)).toBeDefined();
    });

    it('renders Color Distribution label after data loads', async () => {
        vi.mocked(scryfallService.getSets).mockResolvedValue(mockSetsData);
        render(<TransactionDashboard />);
        await waitFor(() => expect(screen.getByText('Color Distribution')).toBeDefined());
    });

    it('renders Start Collecting button', async () => {
        vi.mocked(scryfallService.getSets).mockResolvedValue(mockSetsData);
        render(<TransactionDashboard />);
        expect(screen.getByRole('button', { name: /start collecting/i })).toBeDefined();
    });

    it('renders Browse Now button in Card Scout section', async () => {
        vi.mocked(scryfallService.getSets).mockResolvedValue(mockSetsData);
        render(<TransactionDashboard />);
        await waitFor(() =>
            expect(screen.getByRole('button', { name: /browse now/i })).toBeDefined(),
        );
    });

    it('renders the subtitle for the dashboard', () => {
        vi.mocked(scryfallService.getSets).mockResolvedValue(mockSetsData);
        render(<TransactionDashboard />);
        expect(
            screen.getByText(/your magic: the gathering collection overview/i),
        ).toBeDefined();
    });
});
