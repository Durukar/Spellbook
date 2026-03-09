import { motion } from 'framer-motion'
import { LayoutList, LayoutGrid } from 'lucide-react'
import { useStockListViewModel } from '@/viewmodels/useStockListViewModel'
import type { BackendStockItem } from '@/types/stock'

function StockCard({ item }: { item: BackendStockItem }) {
    const price = Number(item.purchase_price).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    })

    return (
        <div className="bg-bg-elevated border border-border-subtle rounded-xl overflow-hidden flex gap-4 p-4 hover:border-border-default transition-colors">
            <div className="w-16 h-22 shrink-0 rounded-lg overflow-hidden bg-bg-muted">
                {item.image_url ? (
                    <img
                        src={item.image_url}
                        alt={item.card_name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">
                        Sem imagem
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-text-primary truncate">{item.card_name}</h3>
                <p className="text-sm text-text-muted mt-0.5 truncate">{item.set_name}</p>

                <div className="flex items-center gap-3 mt-3">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-bg-muted text-text-secondary border border-border-subtle">
                        {item.condition}
                    </span>
                    <span className="text-sm text-text-secondary">
                        Qtd: <span className="font-medium text-text-primary">{item.quantity}</span>
                    </span>
                    <span className="text-sm text-text-secondary ml-auto">
                        {price}
                    </span>
                </div>
            </div>
        </div>
    )
}

function StockGridCard({ item, index }: { item: BackendStockItem; index: number }) {
    const price = Number(item.purchase_price).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    })

    const isStack = item.quantity > 1

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.03 }}
            className="group relative cursor-pointer"
            style={{ aspectRatio: '2.5/3.5' }}
        >
            {isStack && (
                <>
                    <div className="absolute inset-0 rounded-xl bg-bg-muted border border-border-subtle translate-x-2 translate-y-2 scale-[0.97]" />
                    <div className="absolute inset-0 rounded-xl bg-bg-muted border border-border-subtle translate-x-1 translate-y-1 scale-[0.985]" />
                </>
            )}

            <div className="relative w-full h-full rounded-xl overflow-hidden bg-bg-muted border border-border-subtle">
                {item.image_url ? (
                    <img
                        src={item.image_url}
                        alt={item.card_name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted text-xs p-2 text-center">
                        {item.card_name}
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3 gap-1">
                    <p className="text-white text-xs font-semibold leading-tight line-clamp-2">
                        {item.card_name}
                    </p>
                    <p className="text-white/60 text-[10px] truncate">{item.set_name}</p>
                    <div className="flex items-center justify-between mt-1">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white border border-white/20">
                            {item.condition}
                        </span>
                        <span className="text-white text-xs font-medium">{price}</span>
                    </div>
                </div>

                {isStack && (
                    <div className="absolute top-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md backdrop-blur-sm bg-black/50 border border-white/10 text-white/80 text-[10px] font-medium tracking-wide">
                        <span className="opacity-50">×</span>
                        <span>{item.quantity}</span>
                    </div>
                )}
            </div>
        </motion.div>
    )
}

export function StockListView() {
    const { items, isLoading, error, viewMode, setViewMode } = useStockListViewModel()

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full text-text-muted">
                Carregando...
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full text-red-400">
                Falha ao carregar cartas. Verifique a conexao com o servidor.
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="px-6 py-5 border-b border-border-subtle shrink-0 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Todas as Cartas</h1>
                    <p className="text-sm text-text-muted mt-1">
                        {items.length} {items.length === 1 ? 'carta cadastrada' : 'cartas cadastradas'}
                    </p>
                </div>

                <div className="flex items-center gap-1 p-1 rounded-lg bg-bg-muted border border-border-subtle">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-md transition-colors ${
                            viewMode === 'list'
                                ? 'bg-bg-elevated border border-border-default text-text-primary shadow-sm'
                                : 'text-text-muted hover:text-text-secondary'
                        }`}
                        title="Modo lista"
                    >
                        <LayoutList size={16} />
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded-md transition-colors ${
                            viewMode === 'grid'
                                ? 'bg-bg-elevated border border-border-default text-text-primary shadow-sm'
                                : 'text-text-muted hover:text-text-secondary'
                        }`}
                        title="Modo grade"
                    >
                        <LayoutGrid size={16} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-text-muted">
                        <p className="text-lg">Nenhuma carta cadastrada ainda.</p>
                        <p className="text-sm">Use a busca para encontrar cartas e adicione ao seu estoque.</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                        {items.map((item, index) => (
                            <StockGridCard key={item.id} item={item} index={index} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {items.map(item => (
                            <StockCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
