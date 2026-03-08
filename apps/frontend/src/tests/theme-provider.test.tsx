import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '@/components/theme-provider';

function ThemeConsumer() {
    const { theme, setTheme } = useTheme();
    return (
        <div>
            <span data-testid="current-theme">{theme}</span>
            <button data-testid="toggle-theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                Toggle
            </button>
        </div>
    );
}

describe('ThemeProvider', () => {
    beforeEach(() => {
        localStorage.clear();
        document.documentElement.classList.remove('light', 'dark');
    });

    it('renders children correctly', () => {
        render(
            <ThemeProvider defaultTheme="dark">
                <span data-testid="child">content</span>
            </ThemeProvider>
        );
        expect(screen.getByTestId('child')).toBeDefined();
        expect(screen.getByTestId('child').textContent).toBe('content');
    });

    it('uses defaultTheme when no localStorage value exists', () => {
        render(
            <ThemeProvider defaultTheme="dark">
                <ThemeConsumer />
            </ThemeProvider>
        );
        expect(screen.getByTestId('current-theme').textContent).toBe('dark');
    });

    it('reads theme from localStorage when available', () => {
        localStorage.setItem('vite-ui-theme', 'light');
        render(
            <ThemeProvider defaultTheme="dark">
                <ThemeConsumer />
            </ThemeProvider>
        );
        expect(screen.getByTestId('current-theme').textContent).toBe('light');
    });

    it('adds dark class to documentElement when theme is dark', () => {
        render(
            <ThemeProvider defaultTheme="dark">
                <ThemeConsumer />
            </ThemeProvider>
        );
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        expect(document.documentElement.classList.contains('light')).toBe(false);
    });

    it('adds light class to documentElement when theme is light', () => {
        render(
            <ThemeProvider defaultTheme="light">
                <ThemeConsumer />
            </ThemeProvider>
        );
        expect(document.documentElement.classList.contains('light')).toBe(true);
        expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('toggles theme from dark to light on setTheme call', async () => {
        const user = userEvent.setup();
        render(
            <ThemeProvider defaultTheme="dark">
                <ThemeConsumer />
            </ThemeProvider>
        );
        expect(screen.getByTestId('current-theme').textContent).toBe('dark');

        await user.click(screen.getByTestId('toggle-theme'));

        expect(screen.getByTestId('current-theme').textContent).toBe('light');
        expect(document.documentElement.classList.contains('light')).toBe(true);
        expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('persists theme to localStorage on change', async () => {
        const user = userEvent.setup();
        render(
            <ThemeProvider defaultTheme="dark">
                <ThemeConsumer />
            </ThemeProvider>
        );

        await user.click(screen.getByTestId('toggle-theme'));

        expect(localStorage.getItem('vite-ui-theme')).toBe('light');
    });

    it('uses custom storageKey', () => {
        localStorage.setItem('custom-key', 'light');
        render(
            <ThemeProvider defaultTheme="dark" storageKey="custom-key">
                <ThemeConsumer />
            </ThemeProvider>
        );
        expect(screen.getByTestId('current-theme').textContent).toBe('light');
    });

    it('resolves system theme to dark class when prefers-color-scheme is dark', () => {
        render(
            <ThemeProvider defaultTheme="system">
                <ThemeConsumer />
            </ThemeProvider>
        );
        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
});
