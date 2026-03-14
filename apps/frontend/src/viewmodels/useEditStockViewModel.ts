import { useState } from 'react'
import { apiService } from '@/services/apiService'
import type { BackendStockItem, UpdateStockItemPayload } from '@/types/stock'
import type { CardCondition } from '@/models/Stock'

interface EditForm {
    quantity: number
    purchase_price: number
    condition: CardCondition
    is_foil: boolean
}

function itemToForm(item: BackendStockItem): EditForm {
    return {
        quantity: item.quantity,
        purchase_price: Number(item.purchase_price),
        condition: item.condition,
        is_foil: item.is_foil,
    }
}

export function useEditStockViewModel(item: BackendStockItem) {
    const [isEditing, setIsEditing] = useState(false)
    const [editForm, setEditForm] = useState<EditForm>(itemToForm(item))
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const startEdit = () => {
        setEditForm(itemToForm(item))
        setError(null)
        setIsEditing(true)
    }

    const cancelEdit = () => {
        setEditForm(itemToForm(item))
        setError(null)
        setIsEditing(false)
    }

    const updateField = <K extends keyof EditForm>(field: K, value: EditForm[K]) => {
        setEditForm(prev => ({ ...prev, [field]: value }))
    }

    const saveEdit = async (onSuccess: (updated: BackendStockItem) => void) => {
        setIsSaving(true)
        setError(null)
        try {
            const payload: UpdateStockItemPayload = {
                quantity: editForm.quantity,
                purchase_price: editForm.purchase_price,
                condition: editForm.condition,
                is_foil: editForm.is_foil,
            }
            const updated = await apiService.updateStockItem(item.id, payload)
            setIsEditing(false)
            onSuccess(updated)
        } catch {
            setError('Erro ao salvar alteracoes.')
        } finally {
            setIsSaving(false)
        }
    }

    const confirmDelete = async (onSuccess: () => void) => {
        setIsDeleting(true)
        setError(null)
        try {
            await apiService.deleteStockItem(item.id)
            onSuccess()
        } catch {
            setError('Erro ao excluir a carta.')
        } finally {
            setIsDeleting(false)
        }
    }

    return {
        isEditing,
        editForm,
        isSaving,
        isDeleting,
        error,
        startEdit,
        cancelEdit,
        updateField,
        saveEdit,
        confirmDelete,
    }
}
