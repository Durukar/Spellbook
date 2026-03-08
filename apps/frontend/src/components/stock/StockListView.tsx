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

export function StockListView() {
    const { items, isLoading, error } = useStockListViewModel()

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
            <div className="px-6 py-5 border-b border-border-subtle shrink-0">
                <h1 className="text-2xl font-bold text-text-primary">Todas as Cartas</h1>
                <p className="text-sm text-text-muted mt-1">
                    {items.length} {items.length === 1 ? 'carta cadastrada' : 'cartas cadastradas'}
                </p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-text-muted">
                        <p className="text-lg">Nenhuma carta cadastrada ainda.</p>
                        <p className="text-sm">Use a busca para encontrar cartas e adicione ao seu estoque.</p>
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
