import { useState } from 'react'
import { apiService } from '@/services/apiService'
import type { BackendBuyer, CreateBuyerPayload } from '@/types/buyer'

interface AddForm {
    name: string
    phone: string
    instagram: string
    city: string
    notes: string
}

const EMPTY_FORM: AddForm = {
    name: '',
    phone: '',
    instagram: '',
    city: '',
    notes: '',
}

export function useAddBuyerViewModel() {
    const [form, setForm] = useState<AddForm>(EMPTY_FORM)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const updateField = <K extends keyof AddForm>(field: K, value: AddForm[K]) => {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    const reset = () => {
        setForm(EMPTY_FORM)
        setError(null)
    }

    const saveBuyer = async (onSuccess: (created: BackendBuyer) => void) => {
        if (!form.name.trim() || !form.phone.trim()) {
            setError('Nome e telefone sao obrigatorios.')
            return
        }

        setIsLoading(true)
        setError(null)
        try {
            const payload: CreateBuyerPayload = {
                name: form.name.trim(),
                phone: form.phone.trim(),
                instagram: form.instagram.trim() || undefined,
                city: form.city.trim() || undefined,
                notes: form.notes.trim() || undefined,
            }
            const created = await apiService.addBuyer(payload)
            reset()
            onSuccess(created)
        } catch {
            setError('Erro ao cadastrar comprador.')
        } finally {
            setIsLoading(false)
        }
    }

    return { form, isLoading, error, updateField, reset, saveBuyer }
}
