import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Phone, MapPin, Instagram, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useBuyersListViewModel } from '@/viewmodels/useBuyersListViewModel'
import { useBuyerDetailViewModel } from '@/viewmodels/useBuyerDetailViewModel'
import { BuyerDetailDrawer } from '@/components/buyers/BuyerDetailDrawer'
import { AddBuyerSheet } from '@/components/buyers/AddBuyerSheet'
import type { BackendBuyer } from '@/types/buyer'

function BuyerAvatar({ name }: { name: string }) {
    const initials = name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0]?.toUpperCase() ?? '')
        .join('')

    return (
        <div className="w-10 h-10 rounded-full bg-bg-muted border border-border-subtle flex items-center justify-center shrink-0 text-sm font-bold text-text-secondary">
            {initials}
        </div>
    )
}

function BuyerRow({ buyer, index, onClick }: { buyer: BackendBuyer; index: number; onClick?: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, delay: index * 0.03 }}
            className="bg-bg-elevated border border-border-subtle rounded-xl flex items-center gap-4 px-4 py-3 hover:border-border-default transition-colors cursor-pointer"
            onClick={onClick}
        >
            <BuyerAvatar name={buyer.name} />

            <div className="flex-1 min-w-0">
                <p className="font-semibold text-text-primary truncate">{buyer.name}</p>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-xs text-text-muted flex items-center gap-1">
                        <Phone size={10} />
                        {buyer.phone}
                    </span>
                    {buyer.instagram && (
                        <span className="text-xs text-text-muted flex items-center gap-1">
                            <Instagram size={10} />
                            {buyer.instagram}
                        </span>
                    )}
                    {buyer.city && (
                        <span className="text-xs text-text-muted flex items-center gap-1">
                            <MapPin size={10} />
                            {buyer.city}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

export function BuyersListView() {
    const { buyers, isLoading, error, refresh } = useBuyersListViewModel()
    const { selectedBuyer, isOpen, openDetail, closeDetail } = useBuyerDetailViewModel()
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [search, setSearch] = useState('')

    const filtered = buyers.filter((b) => {
        const q = search.toLowerCase()
        return b.name.toLowerCase().includes(q) || b.phone.includes(q)
    })

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
                Falha ao carregar compradores. Verifique a conexao com o servidor.
            </div>
        )
    }

    return (
        <>
            <div className="flex flex-col h-full overflow-hidden">
                <div className="px-6 py-5 border-b border-border-subtle shrink-0 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">Compradores</h1>
                        <p className="text-sm text-text-muted mt-1">
                            {buyers.length}{' '}
                            {buyers.length === 1 ? 'comprador cadastrado' : 'compradores cadastrados'}
                        </p>
                    </div>

                    <Button
                        size="sm"
                        onClick={() => setIsAddOpen(true)}
                        className="gap-1.5"
                    >
                        <UserPlus size={14} />
                        Novo Comprador
                    </Button>
                </div>

                <div className="px-6 pt-4 shrink-0">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                        <Input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por nome ou telefone..."
                            className="pl-8 h-9 bg-bg-elevated border-border-subtle text-text-primary text-sm"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-text-muted">
                            <p className="text-lg">
                                {search ? 'Nenhum comprador encontrado.' : 'Nenhum comprador cadastrado ainda.'}
                            </p>
                            {!search && (
                                <p className="text-sm">
                                    Clique em "Novo Comprador" para adicionar.
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {filtered.map((buyer, index) => (
                                <BuyerRow
                                    key={buyer.id}
                                    buyer={buyer}
                                    index={index}
                                    onClick={() => openDetail(buyer)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {selectedBuyer && (
                <BuyerDetailDrawer
                    buyer={selectedBuyer}
                    isOpen={isOpen}
                    onClose={closeDetail}
                    onUpdate={() => refresh()}
                    onDelete={() => { closeDetail(); refresh() }}
                />
            )}

            <AddBuyerSheet
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onSuccess={() => refresh()}
            />
        </>
    )
}
