const FOIL_GRADIENT = 'linear-gradient(115deg, #b490ff, #60c8ff, #80ffcc, #ffd580, #b490ff)'

export function FoilCardOverlay() {
    return <div className="foil-overlay" aria-hidden="true" />
}

export function FoilBadge({ className = '' }: { className?: string }) {
    return (
        <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black tracking-widest text-white border border-white/20 ${className}`}
            style={{
                background: FOIL_GRADIENT,
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
                animation: 'foil-shimmer 6s ease-in-out infinite',
            } : undefined}
        >
            {active && <div className="absolute inset-0 bg-black/30" />}
            <span className="relative z-10">{active ? 'Foil ativado' : 'Foil'}</span>
        </button>
    )
}
