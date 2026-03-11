import { useState } from 'react'
import { apiService } from '@/services/apiService'
import type { ScryfallCard } from '@/types/scryfall'
import type { BackendBuyer } from '@/types/buyer'

export type TradeSide = 'A' | 'B'

export interface TradeCard {
    id: string
    name: string
    set_name: string
    image_url: string | null
    price_usd: number
}

function toTradeCard(card: ScryfallCard): TradeCard {
    const price = Number(card.prices?.usd ?? card.prices?.usd_foil ?? 0)
    const image = card.image_uris?.normal ?? card.card_faces?.[0]?.image_uris?.normal ?? null
    return { id: card.id, name: card.name, set_name: card.set_name, image_url: image, price_usd: price }
}

export function useTradeAnalyzerViewModel() {
    const [sideA, setSideA] = useState<TradeCard[]>([])
    const [sideB, setSideB] = useState<TradeCard[]>([])
    const [partnerBuyerId, setPartnerBuyerId] = useState<string | null>(null)
    const [partnerBuyer, setPartnerBuyer] = useState<BackendBuyer | null>(null)
    const [buyers, setBuyers] = useState<BackendBuyer[]>([])
    const [searchA, setSearchA] = useState('')
    const [searchB, setSearchB] = useState('')
    const [resultsA, setResultsA] = useState<ScryfallCard[]>([])
    const [resultsB, setResultsB] = useState<ScryfallCard[]>([])
    const [isSearchingA, setIsSearchingA] = useState(false)
    const [isSearchingB, setIsSearchingB] = useState(false)

    const totalA = sideA.reduce((acc, c) => acc + c.price_usd, 0)
    const totalB = sideB.reduce((acc, c) => acc + c.price_usd, 0)
    const difference = totalA - totalB
    const differencePercent = totalB === 0 ? 0 : (difference / totalB) * 100
    const winner: 'A' | 'B' | 'equal' =
        Math.abs(difference) < 0.01 ? 'equal' : difference > 0 ? 'A' : 'B'

    function addToSide(side: TradeSide, card: ScryfallCard) {
        const tradeCard = toTradeCard(card)
        if (side === 'A') {
            setSideA((prev) => prev.some((c) => c.id === tradeCard.id) ? prev : [...prev, tradeCard])
            setResultsA([])
            setSearchA('')
        } else {
            setSideB((prev) => prev.some((c) => c.id === tradeCard.id) ? prev : [...prev, tradeCard])
            setResultsB([])
            setSearchB('')
        }
    }

    function removeFromSide(side: TradeSide, id: string) {
        if (side === 'A') setSideA((prev) => prev.filter((c) => c.id !== id))
        else setSideB((prev) => prev.filter((c) => c.id !== id))
    }

    async function searchCards(side: TradeSide, query: string) {
        if (side === 'A') { setSearchA(query); if (!query.trim()) { setResultsA([]); return } }
        else { setSearchB(query); if (!query.trim()) { setResultsB([]); return } }

        if (query.trim().length < 2) return

        if (side === 'A') setIsSearchingA(true)
        else setIsSearchingB(true)

        try {
            const res = await apiService.searchCards(query)
            if (side === 'A') setResultsA(res.data?.slice(0, 8) ?? [])
            else setResultsB(res.data?.slice(0, 8) ?? [])
        } catch {
            if (side === 'A') setResultsA([])
            else setResultsB([])
        } finally {
            if (side === 'A') setIsSearchingA(false)
            else setIsSearchingB(false)
        }
    }

    async function loadBuyers() {
        try {
            const data = await apiService.listBuyers()
            setBuyers(data)
        } catch { /* silently fail */ }
    }

    function selectPartner(buyerId: string | null) {
        setPartnerBuyerId(buyerId)
        setPartnerBuyer(buyers.find((b) => b.id === buyerId) ?? null)
    }

    function reset() {
        setSideA([])
        setSideB([])
        setPartnerBuyerId(null)
        setPartnerBuyer(null)
        setSearchA('')
        setSearchB('')
        setResultsA([])
        setResultsB([])
    }

    return {
        sideA,
        sideB,
        totalA,
        totalB,
        difference,
        differencePercent,
        winner,
        partnerBuyerId,
        partnerBuyer,
        buyers,
        searchA,
        searchB,
        resultsA,
        resultsB,
        isSearchingA,
        isSearchingB,
        addToSide,
        removeFromSide,
        searchCards,
        loadBuyers,
        selectPartner,
        reset,
    }
}
