import { useState } from 'react'
import { apiService } from '@/services/apiService'
import type { BackendBuyer, UpdateBuyerPayload } from '@/types/buyer'

interface EditForm {
    name: string
    phone: string
    instagram: string
    city: string
    notes: string
}

function buyerToForm(buyer: BackendBuyer): EditForm {
    return {
        name: buyer.name,
        phone: buyer.phone,
        instagram: buyer.instagram ?? '',
        city: buyer.city ?? '',
        notes: buyer.notes ?? '',
    }
}

export function useEditBuyerViewModel(buyer: BackendBuyer) {
    const [isEditing, setIsEditing] = useState(false)
    const [editForm, setEditForm] = useState<EditForm>(buyerToForm(buyer))
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const startEdit = () => {
        setEditForm(buyerToForm(buyer))
        setError(null)
        setIsEditing(true)
    }

    const cancelEdit = () => {
        setEditForm(buyerToForm(buyer))
        setError(null)
        setIsEditing(false)
    }

    const updateField = <K extends keyof EditForm>(field: K, value: EditForm[K]) => {
        setEditForm(prev => ({ ...prev, [field]: value }))
    }

    const saveEdit = async (onSuccess: (updated: BackendBuyer) => void) => {
        setIsSaving(true)
        setError(null)
        try {
            const payload: UpdateBuyerPayload = {
                name: editForm.name,
                phone: editForm.phone,
                instagram: editForm.instagram || undefined,
                city: editForm.city || undefined,
                notes: editForm.notes || undefined,
            }
            const updated = await apiService.updateBuyer(buyer.id, payload)
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
            await apiService.deleteBuyer(buyer.id)
            onSuccess()
        } catch {
            setError('Erro ao excluir o comprador.')
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
