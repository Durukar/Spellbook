import { useState, useEffect } from 'react'
import { apiService } from '@/services/apiService'
import type { BackendBuyer } from '@/types/buyer'

export function useBuyersListViewModel() {
    const [buyers, setBuyers] = useState<BackendBuyer[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchBuyers = () => {
        setIsLoading(true)
        apiService.listBuyers()
            .then(data => {
                setBuyers(data)
                setIsLoading(false)
            })
            .catch((err: Error) => {
                setError(err.message)
                setIsLoading(false)
            })
    }

    useEffect(() => { fetchBuyers() }, [])

    const refresh = () => fetchBuyers()

    return { buyers, isLoading, error, refresh }
}
