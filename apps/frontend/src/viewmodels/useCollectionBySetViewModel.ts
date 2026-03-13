import { useState, useEffect } from 'react'
import { apiService } from '@/services/apiService'
import { scryfallService } from '@/services/scryfallService'
import type { BackendStockItem, SetCollection } from '@/types/stock'

export function useCollectionBySetViewModel() {
    const [sets, setSets] = useState<SetCollection[]>([])
    const [selectedSetName, setSelectedSetName] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const [stockItems, scryfallSets] = await Promise.all([
                apiService.listStockItems(),
                scryfallService.getSets(),
            ])

            const iconMap = new Map<string, string>()
            for (const s of scryfallSets.data) {
                iconMap.set(s.name.toLowerCase(), s.icon_svg_uri)
            }

            const grouped = new Map<string, BackendStockItem[]>()
            for (const item of stockItems) {
                const existing = grouped.get(item.set_name) ?? []
                existing.push(item)
                grouped.set(item.set_name, existing)
            }

            const result: SetCollection[] = []
            for (const [set_name, items] of grouped.entries()) {
                const total_quantity = items.reduce((sum, i) => sum + i.quantity, 0)
                const total_value = items.reduce((sum, i) => sum + i.purchase_price * i.quantity, 0)
                const foil_count = items.filter(i => i.is_foil).length
                result.push({
                    set_name,
                    icon_svg_uri: iconMap.get(set_name.toLowerCase()),
                    unique_cards: items.length,
                    total_quantity,
                    total_value,
                    foil_count,
                    items,
                })
            }

            result.sort((a, b) => b.total_value - a.total_value)
            setSets(result)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    const selectedSet = sets.find(s => s.set_name === selectedSetName) ?? null

    return {
        sets,
        isLoading,
        error,
        selectedSet,
        selectSet: (name: string) => setSelectedSetName(name),
        clearSelection: () => setSelectedSetName(null),
        refresh: fetchData,
    }
}
