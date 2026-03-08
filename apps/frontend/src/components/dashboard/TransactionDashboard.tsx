import {
    Search,
    Bell,
    Plus,
    RefreshCw,
    Info,
    TrendingUp,
    Sliders,
    Camera,
    Maximize2,
    BookOpen,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Area,
    AreaChart,
} from 'recharts';
import { Button } from '../ui/button';
import { useDashboardViewModel } from '@/viewmodels/useDashboardViewModel';

function GridLoading() {
    return (
        <div className="col-span-12 row-span-2 flex items-center justify-center">
            <p className="text-text-secondary text-sm">Loading catalog...</p>
        </div>
    );
}

function GridError({ message }: { message: string }) {
    return (
        <div className="col-span-12 row-span-2 flex items-center justify-center">
            <p className="text-sm" style={{ color: 'var(--color-status-error, #f87171)' }}>
                {message}
            </p>
        </div>
    );
}

export function TransactionDashboard() {
    const { stats, isLoading, error } = useDashboardViewModel();

    return (
        <div className="w-full h-screen bg-bg-base text-text-primary flex flex-col overflow-hidden selection:bg-brand-500/30">

            {/* Main Header */}
            <div className="h-14 px-8 flex justify-between items-center shrink-0 border-b border-border-subtle/50">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                        <span className="text-text-primary font-bold text-sm">Collection Value</span>
                        <div className="flex items-center gap-2 bg-bg-card border border-border-subtle rounded-xl py-1.5 px-3">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
                                <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                                <path d="M12 12h.01"></path>
                            </svg>
                            <span className="font-bold text-text-primary text-sm">
                                ${(stats?.collectionValue ?? 0).toFixed(2)}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center hover:bg-brand-400 transition-colors shadow-lg shadow-brand-500/20">
                            <Plus size={16} />
                        </button>
                        <button className="w-9 h-9 rounded-xl bg-bg-card text-text-primary flex items-center justify-center hover:bg-border-subtle transition-colors border border-border-subtle">
                            <RefreshCw size={14} />
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <div className="relative w-56">
                        <Search className="absolute left-3 top-2 text-text-muted" size={14} />
                        <input
                            type="text"
                            placeholder="Search cards..."
                            className="w-full bg-bg-card border border-border-subtle rounded-xl py-1.5 pl-9 pr-12 focus:outline-none focus:border-border-highlight transition-colors text-text-primary placeholder-text-muted text-sm"
                        />
                        <div className="absolute right-2 top-1.5 flex items-center gap-1 border border-border-highlight rounded px-1.5 py-0.5 bg-bg-sidebar">
                            <span className="text-[10px] text-text-secondary">&#8984; K</span>
                        </div>
                    </div>
                    <button className="w-9 h-9 rounded-xl bg-bg-card border border-border-subtle flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors relative">
                        <Bell size={16} />
                        <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-red-400"></span>
                    </button>
                    <div className="h-5 w-px bg-border-subtle mx-1"></div>
                    <button className="h-9 px-3 rounded-xl bg-bg-card border border-border-subtle flex items-center gap-2 text-text-primary font-medium hover:bg-border-subtle transition-colors text-sm">
                        Collector
                    </button>
                </div>
            </div>

            {/* Dashboard Body */}
            <div className="flex-1 flex flex-col px-6 py-4 overflow-hidden">

                {/* Title Row */}
                <div className="flex justify-between items-start mb-4 shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
                        <p className="text-xs text-text-secondary mt-0.5">
                            Your Magic: The Gathering collection overview.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="rounded-lg border-border-subtle text-xs font-medium h-8 bg-bg-card text-text-secondary hover:text-text-primary gap-1.5">
                            <Plus size={14} /> Add Card
                        </Button>
                        <Button variant="outline" className="rounded-lg border-border-subtle text-xs font-medium h-8 bg-bg-card text-text-secondary hover:text-text-primary gap-1.5">
                            <Sliders size={14} /> All Time
                        </Button>
                        <Button className="rounded-lg text-xs font-medium h-8 bg-brand-500 hover:bg-brand-400 text-white">
                            Start Collecting
                        </Button>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="flex-1 grid grid-cols-12 grid-rows-2 gap-4 min-h-0">
                    {isLoading && <GridLoading />}
                    {!isLoading && error && <GridError message={error} />}
                    {!isLoading && !error && stats && (
                        <>
                            {/* My Collection Card */}
                            <div className="col-span-4 row-span-1 bg-bg-card border border-border-subtle rounded-2xl p-5 flex flex-col">
                                <div className="flex items-center gap-1.5 mb-3">
                                    <h3 className="text-sm font-semibold text-text-secondary">My Collection</h3>
                                    <Info size={12} className="text-text-muted" />
                                </div>
                                <div className="text-3xl font-bold text-text-primary mb-2">
                                    {stats.collectionCount}
                                    <span className="text-text-muted text-lg ml-1">cards</span>
                                </div>
                                <div className="flex items-center gap-2 mb-5">
                                    <span className="text-xs font-bold text-text-muted bg-bg-base px-1.5 py-0.5 rounded">
                                        $0.00 total value
                                    </span>
                                </div>

                                <h4 className="text-sm font-bold text-text-primary mb-2">Color Distribution</h4>
                                <div className="flex h-3 rounded-full overflow-hidden mb-4 bg-bg-base">
                                    <div className="bg-yellow-400 h-full" style={{ width: '0%' }}></div>
                                    <div className="bg-blue-400 h-full" style={{ width: '0%' }}></div>
                                    <div className="bg-zinc-700 h-full" style={{ width: '0%' }}></div>
                                    <div className="bg-red-500 h-full" style={{ width: '0%' }}></div>
                                    <div className="bg-green-500 h-full" style={{ width: '0%' }}></div>
                                </div>

                                <div className="mt-auto flex flex-col items-center justify-center gap-2 text-center py-2">
                                    <p className="text-xs text-text-muted">Your collection is empty.</p>
                                    <Button variant="outline" className="rounded-lg border-border-subtle text-xs h-7 bg-bg-base text-text-secondary hover:text-text-primary gap-1">
                                        <Plus size={12} /> Add your first card
                                    </Button>
                                </div>
                            </div>

                            {/* Card Catalog Card */}
                            <div className="col-span-8 row-span-1 bg-bg-card border border-border-subtle rounded-2xl p-5 flex flex-col">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-1.5">
                                        <h3 className="text-sm font-semibold text-text-secondary">Card Catalog</h3>
                                        <Info size={12} className="text-text-muted" />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button className="w-7 h-7 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center">
                                            <TrendingUp size={14} />
                                        </button>
                                        <button className="w-7 h-7 rounded-lg bg-bg-base text-text-muted flex items-center justify-center hover:text-text-primary">
                                            <Sliders size={14} />
                                        </button>
                                        <button className="w-7 h-7 rounded-lg bg-bg-base text-text-muted flex items-center justify-center hover:text-text-primary">
                                            <Camera size={14} />
                                        </button>
                                        <button className="w-7 h-7 rounded-lg bg-bg-base text-text-muted flex items-center justify-center hover:text-text-primary">
                                            <Maximize2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-text-primary mb-1">
                                    {stats.totalCardsInCatalog.toLocaleString()}
                                    <span className="text-text-muted text-lg ml-1">cards</span>
                                </div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs font-bold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">
                                        <TrendingUp size={10} className="inline mr-0.5" />
                                        {stats.totalSets} sets
                                    </span>
                                    <span className="text-xs text-text-muted">across all Magic: The Gathering releases</span>
                                </div>

                                <div className="flex-1 min-h-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={stats.setsByYear}>
                                            <defs>
                                                <linearGradient id="cardsGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity={0.3} />
                                                    <stop offset="100%" stopColor="var(--color-brand-500)" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" opacity={0.3} />
                                            <XAxis dataKey="year" tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${Math.round(v / 1000)}K`} />
                                            <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: '8px', fontSize: '12px' }} />
                                            <Area type="monotone" dataKey="cards" name="Cards" stroke="var(--color-brand-500)" fill="url(#cardsGrad)" strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Recent Expansions */}
                            <div className="col-span-7 row-span-1 bg-bg-card border border-border-subtle rounded-2xl p-5 flex flex-col">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-1.5">
                                        <h3 className="text-sm font-semibold text-text-secondary">Recent Expansions</h3>
                                        <Info size={12} className="text-text-muted" />
                                    </div>
                                    <button className="w-7 h-7 rounded-lg bg-bg-base text-text-muted flex items-center justify-center hover:text-text-primary">
                                        <Maximize2 size={14} />
                                    </button>
                                </div>
                                <div className="text-2xl font-bold text-text-primary mb-1">
                                    {stats.latestExpansionName}
                                </div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs text-text-muted">Latest physical expansion set</span>
                                </div>

                                <div className="flex-1 min-h-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats.recentExpansionChartData} barGap={1}>
                                            <XAxis dataKey="name" tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: '8px', fontSize: '12px' }} />
                                            <Bar dataKey="cards" name="Cards" fill="var(--color-brand-500)" radius={[2, 2, 0, 0]} barSize={24} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Card Scout */}
                            <div className="col-span-5 row-span-1 bg-gradient-to-br from-brand-600/30 via-bg-card to-brand-900/20 border border-brand-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-brand-500/5 backdrop-blur-sm"></div>
                                <div className="absolute top-4 right-4 opacity-10">
                                    <div className="grid grid-cols-4 gap-1">
                                        {Array.from({ length: 16 }).map((_, i) => (
                                            <div key={i} className="w-1.5 h-1.5 rounded-sm bg-white"></div>
                                        ))}
                                    </div>
                                </div>
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="w-14 h-14 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center mb-4">
                                        <BookOpen size={28} className="text-brand-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-text-primary mb-1">Explore the Full</h3>
                                    <h3 className="text-lg font-bold text-text-primary mb-2">Scryfall Catalog</h3>
                                    <p className="text-xs text-text-secondary mb-4 max-w-[240px]">
                                        Search millions of cards, track prices, and discover new additions to your collection.
                                    </p>
                                    <Button className="bg-brand-500 hover:bg-brand-400 text-white rounded-xl px-6 h-9 text-sm font-semibold shadow-lg shadow-brand-500/20">
                                        Browse Now
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
