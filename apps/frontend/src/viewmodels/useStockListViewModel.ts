import { useState, useEffect } from 'react'
import { apiService } from '@/services/apiService'
import type { BackendStockItem } from '@/types/stock'

export function useStockListViewModel() {
    const [items, setItems] = useState<BackendStockItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        apiService.listStockItems()
            .then(data => {
                setItems(data)
                setIsLoading(false)
            })
            .catch((err: Error) => {
                setError(err.message)
                setIsLoading(false)
            })
    }, [])

    return { items, isLoading, error }
}
