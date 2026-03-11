import { useState, useEffect, useCallback } from 'react'
import { apiService } from '@/services/apiService'
import type { BackendSale } from '@/types/sale'

export function useSalesListViewModel() {
    const [sales, setSales] = useState<BackendSale[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const load = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await apiService.listSales()
            setSales(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar vendas.')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        load()
    }, [load])

    return { sales, isLoading, error, refresh: load }
}
