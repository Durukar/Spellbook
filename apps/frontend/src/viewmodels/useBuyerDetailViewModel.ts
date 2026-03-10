import { useState } from 'react'
import type { BackendBuyer } from '@/types/buyer'

export function useBuyerDetailViewModel() {
    const [selectedBuyer, setSelectedBuyer] = useState<BackendBuyer | null>(null)
    const [isOpen, setIsOpen] = useState(false)

    const openDetail = (buyer: BackendBuyer) => {
        setSelectedBuyer(buyer)
        setIsOpen(true)
    }

    const closeDetail = () => {
        setIsOpen(false)
        setSelectedBuyer(null)
    }

    return { selectedBuyer, isOpen, openDetail, closeDetail }
}
