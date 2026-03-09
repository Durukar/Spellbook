import { useState, useEffect } from 'react'
import { apiService } from '@/services/apiService'
import type { BackendStockItem } from '@/types/stock'

type ViewMode = 'list' | 'grid'

const VIEW_MODE_KEY = 'stock-view-mode'

export function useStockListViewModel() {
    const [items, setItems] = useState<BackendStockItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [viewMode, setViewModeState] = useState<ViewMode>(() => {
        const stored = localStorage.getItem(VIEW_MODE_KEY)
        return stored === 'grid' ? 'grid' : 'list'
    })

    const setViewMode = (mode: ViewMode) => {
        localStorage.setItem(VIEW_MODE_KEY, mode)
        setViewModeState(mode)
    }

    const fetchItems = () => {
        setIsLoading(true)
        apiService.listStockItems()
            .then(data => {
                setItems(data)
                setIsLoading(false)
            })
            .catch((err: Error) => {
                setError(err.message)
                setIsLoading(false)
            })
    }

    useEffect(() => { fetchItems() }, [])

    const refresh = () => fetchItems()

    return { items, isLoading, error, viewMode, setViewMode, refresh }
}
