import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/viewmodels/useEditBuyerViewModel', () => ({
    useEditBuyerViewModel: vi.fn(),
}))

import { BuyerDetailDrawer } from '@/components/buyers/BuyerDetailDrawer'
import { useEditBuyerViewModel } from '@/viewmodels/useEditBuyerViewModel'

const mockBuyer = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Joao Silva',
    phone: '11999998888',
    instagram: '@joaosilva',
    city: 'Sao Paulo',
    notes: 'Cliente frequente',
    created_at: '2026-03-09T00:00:00.000Z',
    updated_at: '2026-03-09T00:00:00.000Z',
}

const defaultVm = {
    isEditing: false,
    editForm: {
        name: 'Joao Silva',
        phone: '11999998888',
        instagram: '@joaosilva',
        city: 'Sao Paulo',
        notes: 'Cliente frequente',
    },
    isSaving: false,
    isDeleting: false,
    error: null,
    startEdit: vi.fn(),
    cancelEdit: vi.fn(),
    updateField: vi.fn(),
    saveEdit: vi.fn(),
    confirmDelete: vi.fn(),
}

function renderDrawer(vmOverrides = {}, propOverrides = {}) {
    vi.mocked(useEditBuyerViewModel).mockReturnValue({ ...defaultVm, ...vmOverrides })
    return render(
        <BuyerDetailDrawer
            buyer={mockBuyer}
            isOpen={true}
            onClose={vi.fn()}
            onUpdate={vi.fn()}
            onDelete={vi.fn()}
            {...propOverrides}
        />
    )
}

describe('BuyerDetailDrawer', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useEditBuyerViewModel).mockReturnValue({ ...defaultVm })
    })

    it('exibe o nome e telefone do comprador em modo visualizacao', () => {
        renderDrawer()

        expect(screen.getByText('Joao Silva')).toBeDefined()
        expect(screen.getByText('11999998888')).toBeDefined()
    })

    it('exibe instagram e cidade quando disponiveis', () => {
        renderDrawer()

        expect(screen.getByText('@joaosilva')).toBeDefined()
        expect(screen.getByText('Sao Paulo')).toBeDefined()
    })

    it('exibe botao Editar em modo visualizacao', () => {
        renderDrawer()

        expect(screen.getByRole('button', { name: /editar/i })).toBeDefined()
    })

    it('exibe botao Excluir em modo visualizacao', () => {
        renderDrawer()

        expect(screen.getByRole('button', { name: /excluir/i })).toBeDefined()
    })

    it('chama startEdit ao clicar em Editar', () => {
        const startEdit = vi.fn()
        renderDrawer({ startEdit })

        fireEvent.click(screen.getByRole('button', { name: /editar/i }))

        expect(startEdit).toHaveBeenCalledOnce()
    })

    it('exibe botoes Salvar e Cancelar quando isEditing e true', () => {
        renderDrawer({ isEditing: true })

        expect(screen.getByRole('button', { name: /salvar/i })).toBeDefined()
        expect(screen.getByRole('button', { name: /cancelar/i })).toBeDefined()
    })

    it('nao exibe botao Editar quando isEditing e true', () => {
        renderDrawer({ isEditing: true })

        expect(screen.queryByRole('button', { name: /editar/i })).toBeNull()
    })

    it('chama cancelEdit ao clicar em Cancelar', () => {
        const cancelEdit = vi.fn()
        renderDrawer({ isEditing: true, cancelEdit })

        fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))

        expect(cancelEdit).toHaveBeenCalledOnce()
    })

    it('chama saveEdit ao clicar em Salvar', () => {
        const saveEdit = vi.fn()
        renderDrawer({ isEditing: true, saveEdit })

        fireEvent.click(screen.getByRole('button', { name: /salvar/i }))

        expect(saveEdit).toHaveBeenCalledOnce()
    })

    it('exibe mensagem de erro quando error nao e nulo', () => {
        renderDrawer({ error: 'Erro ao salvar alteracoes.' })

        expect(screen.getByText('Erro ao salvar alteracoes.')).toBeDefined()
    })

    it('exibe dialogo de confirmacao ao clicar em Excluir', () => {
        renderDrawer()

        fireEvent.click(screen.getByRole('button', { name: /excluir/i }))

        expect(screen.getByText(/confirmar exclusao/i)).toBeDefined()
    })

    it('chama confirmDelete ao confirmar exclusao', () => {
        const confirmDelete = vi.fn()
        renderDrawer({ confirmDelete })

        fireEvent.click(screen.getByRole('button', { name: /excluir/i }))
        fireEvent.click(screen.getByRole('button', { name: /confirmar/i }))

        expect(confirmDelete).toHaveBeenCalledOnce()
    })
})
