import { useState } from 'react'
import { apiService } from '@/services/apiService'
import type { BackendStockItem } from '@/types/stock'
import type { PaymentMethod } from '@/types/sale'

const STOP_LOSS_THRESHOLD = 0.15

export interface SaleLineItem {
    stock_item_id: string
    card_name: string
    set_name: string
    image_url: string
    condition: string
    is_foil: boolean
    purchase_price: number
    sale_price: number
    quantity: number
    max_quantity: number
}

export function useCreateSaleViewModel() {
    const [selectedItems, setSelectedItems] = useState<SaleLineItem[]>([])
    const [buyerId, setBuyerId] = useState<string | null>(null)
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')
    const [notes, setNotes] = useState('')
    const [stopLossConfirmed, setStopLossConfirmed] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    function checkStopLoss(purchasePrice: number, salePrice: number): boolean {
        if (purchasePrice === 0) return false
        return (salePrice - purchasePrice) / purchasePrice < -STOP_LOSS_THRESHOLD
    }

    const stopLossItems = selectedItems.filter((i) =>
        checkStopLoss(i.purchase_price, i.sale_price)
    )

    const hasStopLossViolation = stopLossItems.length > 0

    function addItem(stockItem: BackendStockItem) {
        setSelectedItems((prev) => {
            if (prev.some((i) => i.stock_item_id === stockItem.id)) return prev
            return [
                ...prev,
                {
                    stock_item_id: stockItem.id,
                    card_name: stockItem.card_name,
                    set_name: stockItem.set_name,
                    image_url: stockItem.image_url,
                    condition: stockItem.condition,
                    is_foil: stockItem.is_foil,
                    purchase_price: Number(stockItem.purchase_price),
                    sale_price: Number(stockItem.purchase_price),
                    quantity: 1,
                    max_quantity: stockItem.quantity,
                },
            ]
        })
        setStopLossConfirmed(false)
    }

    function removeItem(stockItemId: string) {
        setSelectedItems((prev) => prev.filter((i) => i.stock_item_id !== stockItemId))
        setStopLossConfirmed(false)
    }

    function updateSalePrice(stockItemId: string, price: number) {
        setSelectedItems((prev) =>
            prev.map((i) => (i.stock_item_id === stockItemId ? { ...i, sale_price: price } : i))
        )
        setStopLossConfirmed(false)
    }

    function updateQuantity(stockItemId: string, qty: number) {
        setSelectedItems((prev) =>
            prev.map((i) =>
                i.stock_item_id === stockItemId
                    ? { ...i, quantity: Math.max(1, Math.min(qty, i.max_quantity)) }
                    : i
            )
        )
    }

    function confirmStopLoss() {
        setStopLossConfirmed(true)
    }

    function reset() {
        setSelectedItems([])
        setBuyerId(null)
        setPaymentMethod('pix')
        setNotes('')
        setStopLossConfirmed(false)
        setError(null)
    }

    async function submitSale(): Promise<boolean> {
        if (hasStopLossViolation && !stopLossConfirmed) return false
        if (selectedItems.length === 0) return false

        setIsLoading(true)
        setError(null)

        try {
            await apiService.createSale({
                payment_method: paymentMethod,
                buyer_id: buyerId ?? undefined,
                notes: notes.trim() || undefined,
                items: selectedItems.map((i) => ({
                    stock_item_id: i.stock_item_id,
                    quantity: i.quantity,
                    sale_price: i.sale_price,
                })),
            })
            reset()
            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao registrar venda.')
            return false
        } finally {
            setIsLoading(false)
        }
    }

    const totalAmount = selectedItems.reduce((acc, i) => acc + i.sale_price * i.quantity, 0)
    const totalCost = selectedItems.reduce((acc, i) => acc + i.purchase_price * i.quantity, 0)
    const totalDiscount = Math.max(0, totalCost - totalAmount)

    return {
        selectedItems,
        buyerId,
        setBuyerId,
        paymentMethod,
        setPaymentMethod,
        notes,
        setNotes,
        stopLossItems,
        stopLossConfirmed,
        hasStopLossViolation,
        isLoading,
        error,
        totalAmount,
        totalCost,
        totalDiscount,
        addItem,
        removeItem,
        updateSalePrice,
        updateQuantity,
        confirmStopLoss,
        reset,
        submitSale,
    }
}
