import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppSidebar } from '@/components/layout/Sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/components/theme-provider';

function renderSidebar(defaultTheme: 'dark' | 'light' = 'dark') {
    return render(
        <ThemeProvider defaultTheme={defaultTheme}>
            <TooltipProvider>
                <SidebarProvider>
                    <AppSidebar />
                </SidebarProvider>
            </TooltipProvider>
        </ThemeProvider>
    );
}

describe('AppSidebar', () => {
    beforeEach(() => {
        localStorage.clear();
        document.documentElement.classList.remove('light', 'dark');
    });

    it('renders the SpellBook brand name', () => {
        renderSidebar();
        expect(screen.getByText('SpellBook')).toBeDefined();
    });

    it('renders navigation items', () => {
        renderSidebar();
        expect(screen.getByText('Dashboard')).toBeDefined();
        expect(screen.getByText('Transacoes')).toBeDefined();
        expect(screen.getByText('Colecao')).toBeDefined();
    });

    it('renders the settings and help items', () => {
        renderSidebar();
        expect(screen.getByText('Configuracoes')).toBeDefined();
        expect(screen.getByText('Ajuda e FAQ')).toBeDefined();
    });

    it('renders the sidebar trigger button', () => {
        renderSidebar();
        const trigger = screen.getByRole('button', { name: /toggle sidebar/i });
        expect(trigger).toBeDefined();
    });

    it('sidebar trigger button is always visible (no collapsible-hidden class)', () => {
        renderSidebar();
        const trigger = screen.getByRole('button', { name: /toggle sidebar/i });
        expect(trigger.className).not.toContain('group-data-[collapsible=icon]:hidden');
    });

    it('renders the theme toggle button in dark mode with Modo Claro text', () => {
        renderSidebar('dark');
        expect(screen.getByText('Modo Claro')).toBeDefined();
    });

    it('renders the theme toggle in light mode with Modo Escuro text', () => {
        renderSidebar('light');
        expect(screen.getByText('Modo Escuro')).toBeDefined();
    });

    it('toggles theme when theme button is clicked', async () => {
        const user = userEvent.setup();
        renderSidebar('dark');

        const themeButton = screen.getByText('Modo Claro').closest('button');
        expect(themeButton).not.toBeNull();

        await user.click(themeButton!);

        expect(screen.getByText('Modo Escuro')).toBeDefined();
        expect(document.documentElement.classList.contains('light')).toBe(true);
    });

    it('does NOT render a ToggleRight switch icon in the theme button', () => {
        renderSidebar();
        const themeButton = screen.getByText('Modo Claro').closest('button');
        expect(themeButton).not.toBeNull();
        const svgs = themeButton!.querySelectorAll('svg');
        svgs.forEach((svg) => {
            expect(svg.classList.toString()).not.toContain('toggle-right');
        });
    });
});
