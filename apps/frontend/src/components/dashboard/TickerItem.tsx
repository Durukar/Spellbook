export function TickerItem({ icon, symbol, val, kind }: { icon: React.ReactNode, symbol: string, val: string, kind: 'up' | 'down' }) {
    const isUp = kind === 'up';
    return (
        <div className="flex items-center gap-2">
            {icon}
            <span className="text-white ml-0.5 font-bold tracking-wide">{symbol}</span>
            <div className="w-16 h-3 opacity-60">
                {/* Fake mini sparkline using SVG */}
                <svg viewBox="0 0 50 10" className="w-full h-full" preserveAspectRatio="none">
                    <polyline
                        fill="none"
                        stroke={isUp ? "var(--color-status-success)" : "var(--color-chart-pink)"}
                        strokeWidth="1.5"
                        points={isUp ? "0,8 10,5 20,7 30,2 40,4 50,1" : "0,2 10,4 20,3 30,8 40,6 50,9"}
                    />
                </svg>
            </div>
            <span className={isUp ? "text-status-success" : "text-chart-pink"}>{val}</span>
        </div>
    )
}
