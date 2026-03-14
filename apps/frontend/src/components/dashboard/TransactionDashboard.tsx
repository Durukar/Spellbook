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
    Wallet,
    TrendingDown,
    ShoppingCart,
    Package,
    Users,
    Receipt,
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
import type { PaymentMethod } from '@/types/sale';
import type { AppView } from '@/components/layout/Sidebar';

const PAYMENT_META: Record<PaymentMethod, { label: string; className: string }> = {
    pix: { label: 'PIX', className: 'bg-emerald-500/15 text-emerald-400' },
    dinheiro: { label: 'Dinheiro', className: 'bg-green-500/15 text-green-400' },
    fiado: { label: 'Fiado', className: 'bg-orange-500/15 text-orange-400' },
    cartao: { label: 'Cartao', className: 'bg-blue-500/15 text-blue-400' },
    troca: { label: 'Troca', className: 'bg-purple-500/15 text-purple-400' },
};

function formatSaleDate(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    const diffMs = today.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function GridLoading() {
    return (
        <div className="col-span-12 row-span-2 flex items-center justify-center">
            <p className="text-text-secondary text-sm">Carregando catalogo...</p>
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

function FinancialCard({
    label,
    value,
    icon: Icon,
    color,
}: {
    label: string
    value: string
    icon: React.ElementType
    color: string
}) {
    return (
        <div className="bg-bg-card border border-border-subtle rounded-xl px-4 py-3 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                <Icon size={15} />
            </div>
            <div className="min-w-0">
                <p className="text-xs text-text-muted truncate">{label}</p>
                <p className="text-sm font-bold text-text-primary truncate">{value}</p>
            </div>
        </div>
    )
}

interface TransactionDashboardProps {
    onNavigate?: (view: AppView) => void;
}

export function TransactionDashboard({ onNavigate }: TransactionDashboardProps) {
    const { stats, saleStats, isLoading, error, refresh } = useDashboardViewModel();

    return (
        <div className="w-full h-screen bg-bg-base text-text-primary flex flex-col overflow-hidden selection:bg-brand-500/30">

            <div className="h-14 px-8 flex justify-between items-center shrink-0 border-b border-border-subtle/50">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-bg-card border border-border-subtle rounded-xl py-1.5 px-3">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted">
                                <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                                <path d="M12 12h.01"></path>
                            </svg>
                            <span className="font-bold text-text-primary text-sm">
                                {stats?.collectionValueBRL
                                    ? stats.collectionValueBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                    : '—'}
                            </span>
                            {stats?.usdToBrlRate ? (
                                <span className="text-[10px] text-text-muted border-l border-border-subtle pl-2">
                                    1 USD = {stats.usdToBrlRate.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                            ) : null}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onNavigate?.('search')}
                            className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center hover:bg-brand-400 transition-colors shadow-lg shadow-brand-500/20"
                            title="Buscar carta para adicionar ao estoque"
                            aria-label="Adicionar Carta"
                        >
                            <Plus size={16} />
                        </button>
                        <button
                            onClick={refresh}
                            className="w-9 h-9 rounded-xl bg-bg-card text-text-primary flex items-center justify-center hover:bg-border-subtle transition-colors border border-border-subtle"
                            title="Atualizar dados"
                        >
                            <RefreshCw size={14} />
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <div
                        className="relative w-56 text-left cursor-pointer"
                        onClick={() => onNavigate?.('search')}
                    >
                        <Search className="absolute left-3 top-2 text-text-muted" size={14} />
                        <input
                            readOnly
                            placeholder="Buscar cartas..."
                            className="w-full bg-bg-card border border-border-subtle rounded-xl py-1.5 pl-9 pr-12 text-text-muted text-sm hover:border-border-highlight transition-colors cursor-pointer focus:outline-none"
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
                        Colecionador
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col px-6 py-4 overflow-hidden">

                <div className="flex justify-between items-start mb-4 shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
                        <p className="text-xs text-text-secondary mt-0.5">
                            Visao geral da sua colecao Magic: The Gathering.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {(!stats || stats.collectionCount === 0) && (
                            <Button
                                variant="outline"
                                className="rounded-lg border-border-subtle text-xs font-medium h-8 bg-bg-card text-text-secondary hover:text-text-primary gap-1.5"
                                onClick={() => onNavigate?.('search')}
                                aria-label="Comecar a Colecionar"
                            >
                                <Plus size={14} /> Comecar a Colecionar
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            className="rounded-lg border-border-subtle text-xs font-medium h-8 bg-bg-card text-text-secondary hover:text-text-primary gap-1.5"
                            onClick={() => onNavigate?.('allCards')}
                        >
                            <Package size={14} /> Ver Estoque
                        </Button>
                        <Button variant="outline" className="rounded-lg border-border-subtle text-xs font-medium h-8 bg-bg-card text-text-secondary hover:text-text-primary gap-1.5">
                            <Sliders size={14} /> Todos os Tempos
                        </Button>
                        <Button
                            className="rounded-lg text-xs font-medium h-8 bg-brand-500 hover:bg-brand-400 text-white gap-1.5"
                            onClick={() => onNavigate?.('sales')}
                        >
                            <ShoppingCart size={14} /> Nova Venda
                        </Button>
                    </div>
                </div>

                {!isLoading && stats && saleStats && (
                    <div className="grid grid-cols-6 gap-3 mb-4 shrink-0">
                        <FinancialCard
                            label="Patrimonio em Estoque"
                            value={stats.collectionValueBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            icon={Package}
                            color="bg-sky-500/15 text-sky-400"
                        />
                        <FinancialCard
                            label="Receita Total"
                            value={saleStats.total_revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            icon={Wallet}
                            color="bg-emerald-500/15 text-emerald-400"
                        />
                        <FinancialCard
                            label="Lucro Total"
                            value={saleStats.total_profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            icon={saleStats.total_profit >= 0 ? TrendingUp : TrendingDown}
                            color={saleStats.total_profit >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}
                        />
                        <FinancialCard
                            label="Desconto Total"
                            value={saleStats.total_discount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            icon={TrendingDown}
                            color="bg-yellow-500/15 text-yellow-400"
                        />
                        <FinancialCard
                            label="Vendas Realizadas"
                            value={String(saleStats.sales_count)}
                            icon={ShoppingCart}
                            color="bg-purple-500/15 text-purple-400"
                        />
                        <FinancialCard
                            label="Compradores"
                            value={String(stats.buyersCount)}
                            icon={Users}
                            color="bg-pink-500/15 text-pink-400"
                        />
                    </div>
                )}

                <div className="flex-1 grid grid-cols-12 grid-rows-2 gap-4 min-h-0">
                    {isLoading && <GridLoading />}
                    {!isLoading && error && <GridError message={error} />}
                    {!isLoading && !error && stats && (
                        <>
                            {/* Minha Colecao */}
                            <div className="col-span-4 row-span-1 bg-bg-card border border-border-subtle rounded-2xl p-5 flex flex-col">
                                <div className="flex items-center gap-1.5 mb-3">
                                    <h3 className="text-sm font-semibold text-text-secondary">Minha Colecao</h3>
                                    <Info size={12} className="text-text-muted" />
                                </div>
                                <div className="text-3xl font-bold text-text-primary mb-1">
                                    {stats.collectionCount.toLocaleString()}
                                    <span className="text-text-muted text-lg ml-1">cartas</span>
                                </div>
                                <div className="flex items-center gap-2 mb-4 flex-wrap">
                                    {stats.collectionValueBRL > 0 ? (
                                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                            {stats.collectionValueBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} valor total
                                        </span>
                                    ) : (
                                        <span className="text-xs font-bold text-text-muted bg-bg-base px-1.5 py-0.5 rounded">
                                            Sem valor cadastrado
                                        </span>
                                    )}
                                    {stats.foilPercentage > 0 && (
                                        <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">
                                            {stats.foilPercentage}% Foil
                                        </span>
                                    )}
                                </div>

                                <h4 className="text-xs font-semibold text-text-secondary mb-1">Distribuicao por Cor</h4>
                                <p className="text-xs text-text-muted mb-2">Em breve</p>
                                <h4 className="text-xs font-semibold text-text-secondary mb-2">Distribuicao por Condicao</h4>

                                {stats.conditionDistribution.length > 0 ? (
                                    <>
                                        <div className="flex h-3 rounded-full overflow-hidden mb-2 bg-bg-base">
                                            {stats.conditionDistribution.map((c) => (
                                                <div
                                                    key={c.condition}
                                                    className="h-full transition-all"
                                                    style={{ width: `${c.percentage}%`, backgroundColor: c.color }}
                                                    title={`${c.condition}: ${c.percentage}%`}
                                                />
                                            ))}
                                        </div>
                                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                                            {stats.conditionDistribution.map((c) => (
                                                <span key={c.condition} className="flex items-center gap-1 text-xs text-text-muted">
                                                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                                                    {c.condition}
                                                    <span className="text-text-secondary">{c.percentage}%</span>
                                                </span>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="mt-auto flex flex-col items-center justify-center gap-2 text-center py-2">
                                        <p className="text-xs text-text-muted">Sua colecao esta vazia.</p>
                                                        <Button
                                            variant="outline"
                                            className="rounded-lg border-border-subtle text-xs h-7 bg-bg-base text-text-secondary hover:text-text-primary gap-1"
                                            onClick={() => onNavigate?.('search')}
                                        >
                                            <Plus size={12} /> Adicionar primeira carta
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Catalogo de Cartas */}
                            <div className="col-span-8 row-span-1 bg-bg-card border border-border-subtle rounded-2xl p-5 flex flex-col">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-1.5">
                                        <h3 className="text-sm font-semibold text-text-secondary">Catalogo de Cartas</h3>
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
                                    <span className="text-text-muted text-lg ml-1">cartas</span>
                                </div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs font-bold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">
                                        <TrendingUp size={10} className="inline mr-0.5" />
                                        {stats.totalSets} colecoes
                                    </span>
                                    <span className="text-xs text-text-muted">em todos os lancamentos de Magic: The Gathering</span>
                                    <Button
                                        variant="outline"
                                        className="rounded-lg border-border-subtle text-xs h-6 bg-bg-base text-text-secondary hover:text-text-primary gap-1 ml-auto"
                                        onClick={() => onNavigate?.('search')}
                                    >
                                        Explorar Agora
                                    </Button>
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
                                            <Area type="monotone" dataKey="cards" name="Cartas" stroke="var(--color-brand-500)" fill="url(#cardsGrad)" strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Expansoes Recentes */}
                            <div className="col-span-7 row-span-1 bg-bg-card border border-border-subtle rounded-2xl p-5 flex flex-col">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-1.5">
                                        <h3 className="text-sm font-semibold text-text-secondary">Expansoes Recentes</h3>
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
                                    <span className="text-xs text-text-muted">Expansao fisica mais recente</span>
                                </div>

                                <div className="flex-1 min-h-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats.recentExpansionChartData} barGap={1}>
                                            <XAxis dataKey="name" tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: '8px', fontSize: '12px' }} />
                                            <Bar dataKey="cards" name="Cartas" fill="var(--color-brand-500)" radius={[2, 2, 0, 0]} barSize={24} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Vendas Recentes */}
                            <div className="col-span-5 row-span-1 bg-bg-card border border-border-subtle rounded-2xl p-5 flex flex-col">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-1.5">
                                        <h3 className="text-sm font-semibold text-text-secondary">Vendas Recentes</h3>
                                        <Info size={12} className="text-text-muted" />
                                    </div>
                                    {stats.recentSales.length > 0 && (
                                        <span className="text-xs text-text-muted bg-bg-base px-2 py-0.5 rounded-full border border-border-subtle">
                                            {stats.recentSales.length} vendas
                                        </span>
                                    )}
                                </div>

                                {stats.recentSales.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
                                        <div className="w-10 h-10 rounded-xl bg-bg-base border border-border-subtle flex items-center justify-center">
                                            <Receipt size={20} className="text-text-muted" />
                                        </div>
                                        <p className="text-xs text-text-muted">Nenhuma venda registrada ainda.</p>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col gap-1 overflow-auto min-h-0">
                                        {stats.recentSales.map((sale) => {
                                            const meta = PAYMENT_META[sale.payment_method];
                                            return (
                                                <div
                                                    key={sale.id}
                                                    className="flex items-center gap-3 py-2 border-b border-border-subtle/40 last:border-0"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-medium text-text-primary truncate">
                                                            {sale.buyer_name ?? 'Venda Direta'}
                                                        </p>
                                                        <p className="text-[10px] text-text-muted">
                                                            {sale.items.length} {sale.items.length === 1 ? 'item' : 'itens'}
                                                        </p>
                                                    </div>
                                                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0 ${meta.className}`}>
                                                        {meta.label}
                                                    </span>
                                                    <div className="text-right shrink-0">
                                                        <p className="text-xs font-bold text-text-primary">
                                                            {sale.total_amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                        </p>
                                                        <p className="text-[10px] text-text-muted">{formatSaleDate(sale.created_at)}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
