import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { useCollectionBySetViewModel } from '@/viewmodels/useCollectionBySetViewModel'
import { useCardDetailViewModel } from '@/viewmodels/useCardDetailViewModel'
import { CardDetailDrawer } from '@/components/stock/CardDetailDrawer'
import { StockGridCard } from '@/components/stock/StockListView'
import { FoilBadge } from '@/components/stock/FoilOverlay'
import type { SetCollection } from '@/types/stock'

function SetCard({ set, index, onClick }: { set: SetCollection; index: number; onClick: () => void }) {
    const value = set.total_value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    })

    return (
        <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.04 }}
            onClick={onClick}
            className="group flex flex-col bg-bg-elevated border border-border-subtle rounded-2xl overflow-hidden hover:border-border-default transition-all duration-200 text-left hover:shadow-lg hover:shadow-black/20 focus:outline-none"
        >
            <div className="flex items-center justify-center bg-bg-muted h-28 relative overflow-hidden">
                {set.icon_svg_uri ? (
                    <img
                        src={set.icon_svg_uri}
                        alt={set.set_name}
                        className="w-16 h-16 object-contain opacity-60 group-hover:opacity-90 transition-opacity duration-200 invert"
                    />
                ) : (
                    <div className="w-16 h-16 rounded-full bg-bg-base border border-border-subtle" />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg-elevated/60" />
            </div>

            <div className="p-4 flex flex-col gap-1.5">
                <h3 className="font-semibold text-text-primary text-sm leading-tight line-clamp-2">
                    {set.set_name}
                </h3>
                <p className="text-xs text-text-muted">
                    {set.unique_cards}{' '}
                    {set.unique_cards === 1 ? 'carta' : 'cartas'}{' '}
                    <span className="text-border-default">•</span>{' '}
                    {value}
                </p>
                {set.foil_count > 0 && (
                    <div className="mt-0.5">
                        <FoilBadge />
                    </div>
                )}
            </div>
        </motion.button>
    )
}

function SetDrilldown({
    set,
    onBack,
    onOpenDetail,
}: {
    set: SetCollection
    onBack: () => void
    onOpenDetail: (item: SetCollection['items'][number]) => void
}) {
    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="px-6 py-5 border-b border-border-subtle shrink-0">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-3"
                >
                    <ChevronLeft size={16} />
                    <span>Voltar</span>
                </button>

                <div className="flex items-center gap-3">
                    {set.icon_svg_uri && (
                        <img
                            src={set.icon_svg_uri}
                            alt={set.set_name}
                            className="w-8 h-8 object-contain opacity-70 invert"
                        />
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">{set.set_name}</h1>
                        <p className="text-sm text-text-muted mt-0.5">
                            {set.unique_cards}{' '}
                            {set.unique_cards === 1 ? 'carta unica' : 'cartas unicas'}{' '}
                            <span className="text-border-default mx-1">•</span>
                            {set.total_quantity} no estoque
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {set.items.map((item, index) => (
                        <StockGridCard
                            key={item.id}
                            item={item}
                            index={index}
                            onClick={() => onOpenDetail(item)}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export function CollectionBySetView() {
    const { sets, isLoading, error, selectedSet, selectSet, clearSelection, refresh } =
        useCollectionBySetViewModel()
    const { selectedItem, isOpen, openDetail, closeDetail } = useCardDetailViewModel()

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
                Falha ao carregar colecoes. Verifique a conexao com o servidor.
            </div>
        )
    }

    if (selectedSet) {
        return (
            <>
                <SetDrilldown
                    set={selectedSet}
                    onBack={clearSelection}
                    onOpenDetail={openDetail}
                />
                {selectedItem && (
                    <CardDetailDrawer
                        item={selectedItem}
                        isOpen={isOpen}
                        onClose={closeDetail}
                        onUpdate={() => refresh()}
                        onDelete={() => { closeDetail(); refresh() }}
                    />
                )}
            </>
        )
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="px-6 py-5 border-b border-border-subtle shrink-0">
                <h1 className="text-2xl font-bold text-text-primary">Por Colecao</h1>
                <p className="text-sm text-text-muted mt-1">
                    {sets.length}{' '}
                    {sets.length === 1 ? 'colecao com cartas' : 'colecoes com cartas'}
                </p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
                {sets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-text-muted">
                        <p className="text-lg">Nenhuma colecao cadastrada ainda.</p>
                        <p className="text-sm">
                            Use a busca para encontrar cartas e adicione ao seu estoque.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {sets.map((set, index) => (
                            <SetCard
                                key={set.set_name}
                                set={set}
                                index={index}
                                onClick={() => selectSet(set.set_name)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
