import { useState } from 'react'
import type { BackendStockItem } from '@/types/stock'

export function useCardDetailViewModel() {
    const [selectedItem, setSelectedItem] = useState<BackendStockItem | null>(null)
    const [isOpen, setIsOpen] = useState(false)

    const openDetail = (item: BackendStockItem) => {
        setSelectedItem(item)
        setIsOpen(true)
    }

    const closeDetail = () => {
        setIsOpen(false)
        setSelectedItem(null)
    }

    return { selectedItem, isOpen, openDetail, closeDetail }
}
