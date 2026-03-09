const FOIL_GRADIENT = 'linear-gradient(115deg, #ff00b4, #00c8ff, #64ff64, #ffdc00, #ff6400, #b400ff, #ff00b4)'

export function FoilCardOverlay() {
    return <div className="foil-overlay" aria-hidden="true" />
}

export function FoilBadge({ className = '' }: { className?: string }) {
    return (
        <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black tracking-widest text-white border border-white/20 ${className}`}
            style={{
                background: FOIL_GRADIENT,
                backgroundSize: '300% 300%',
                animation: 'foil-shimmer 4s ease-in-out infinite',
            }}
        >
            FOIL
        </span>
    )
}

export function FoilToggleButton({
    active,
    onClick,
}: {
    active: boolean
    onClick: () => void
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                relative flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold
                border transition-all duration-300 overflow-hidden
                ${active
                    ? 'text-white border-white/30 shadow-lg shadow-purple-500/20'
                    : 'text-text-muted border-border-subtle bg-bg-muted/40 hover:text-text-secondary'
                }
            `}
            style={active ? {
                background: FOIL_GRADIENT,
                backgroundSize: '300% 300%',
                animation: 'foil-shimmer 4s ease-in-out infinite',
            } : undefined}
        >
            {active && <div className="absolute inset-0 bg-black/30" />}
            <span className="relative z-10">{active ? 'Foil ativado' : 'Foil'}</span>
        </button>
    )
}
