import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TickerItem } from '@/components/dashboard/TickerItem';

describe('TickerItem', () => {
    it('renders the symbol text', () => {
        render(<TickerItem icon={<span>icon</span>} symbol="BTC" val="+2.4%" kind="up" />);
        expect(screen.getByText('BTC')).toBeDefined();
    });

    it('renders the value text', () => {
        render(<TickerItem icon={<span>icon</span>} symbol="ETH" val="-1.2%" kind="down" />);
        expect(screen.getByText('-1.2%')).toBeDefined();
    });

    it('renders the icon slot', () => {
        render(<TickerItem icon={<span data-testid="ticker-icon">I</span>} symbol="ADA" val="+0.5%" kind="up" />);
        expect(screen.getByTestId('ticker-icon')).toBeDefined();
    });

    it('applies success color class when kind is up', () => {
        const { container } = render(
            <TickerItem icon={<span />} symbol="BTC" val="+2.4%" kind="up" />
        );
        const valEl = screen.getByText('+2.4%');
        expect(valEl.className).toContain('text-status-success');
    });

    it('applies pink/down color class when kind is down', () => {
        render(<TickerItem icon={<span />} symbol="ETH" val="-1.2%" kind="down" />);
        const valEl = screen.getByText('-1.2%');
        expect(valEl.className).toContain('text-chart-pink');
    });

    it('renders a sparkline SVG element', () => {
        const { container } = render(
            <TickerItem icon={<span />} symbol="BTC" val="+2.4%" kind="up" />
        );
        const svg = container.querySelector('svg');
        expect(svg).not.toBeNull();
    });

    it('sparkline polyline stroke uses success color when kind is up', () => {
        const { container } = render(
            <TickerItem icon={<span />} symbol="BTC" val="+2.4%" kind="up" />
        );
        const polyline = container.querySelector('polyline');
        expect(polyline).not.toBeNull();
        expect(polyline!.getAttribute('stroke')).toContain('status-success');
    });

    it('sparkline polyline stroke uses chart-pink color when kind is down', () => {
        const { container } = render(
            <TickerItem icon={<span />} symbol="ETH" val="-1.2%" kind="down" />
        );
        const polyline = container.querySelector('polyline');
        expect(polyline).not.toBeNull();
        expect(polyline!.getAttribute('stroke')).toContain('chart-pink');
    });

    it('up sparkline points go downward from left to right (end Y < start Y)', () => {
        const { container } = render(
            <TickerItem icon={<span />} symbol="BTC" val="+2.4%" kind="up" />
        );
        const polyline = container.querySelector('polyline');
        const points = polyline!.getAttribute('points')!;
        const coords = points.trim().split(/\s+/).map((p) => {
            const [, y] = p.split(',').map(Number);
            return y;
        });
        expect(coords[0]).toBeGreaterThan(coords[coords.length - 1]);
    });

    it('down sparkline points go upward from left to right (end Y > start Y)', () => {
        const { container } = render(
            <TickerItem icon={<span />} symbol="ETH" val="-1.2%" kind="down" />
        );
        const polyline = container.querySelector('polyline');
        const points = polyline!.getAttribute('points')!;
        const coords = points.trim().split(/\s+/).map((p) => {
            const [, y] = p.split(',').map(Number);
            return y;
        });
        expect(coords[0]).toBeLessThan(coords[coords.length - 1]);
    });
});
