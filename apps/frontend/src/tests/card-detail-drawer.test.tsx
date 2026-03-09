import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/viewmodels/useEditStockViewModel', () => ({
    useEditStockViewModel: vi.fn(),
}))

vi.mock('@/components/stock/FoilOverlay', () => ({
    FoilCardOverlay: () => null,
    FoilBadge: () => null,
    FoilToggleButton: ({ isFoil, onToggle }: { isFoil: boolean; onToggle: () => void }) => (
        <button data-testid="foil-toggle" onClick={onToggle}>
            {isFoil ? 'FOIL' : 'Normal'}
        </button>
    ),
}))

import { CardDetailDrawer } from '@/components/stock/CardDetailDrawer'
import { useEditStockViewModel } from '@/viewmodels/useEditStockViewModel'

const mockItem = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    scryfall_id: 'abc123',
    card_name: 'Lightning Bolt',
    set_name: 'Limited Edition Alpha',
    image_url: 'https://example.com/img.jpg',
    purchase_price: 15.0,
    purchase_date: '2026-03-08T00:00:00.000Z',
    condition: 'NM' as const,
    quantity: 2,
    is_foil: false,
    created_at: '2026-03-08T00:00:00.000Z',
}

const defaultVm = {
    isEditing: false,
    editForm: {
        quantity: 2,
        purchase_price: 15.0,
        condition: 'NM' as const,
        is_foil: false,
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
    vi.mocked(useEditStockViewModel).mockReturnValue({ ...defaultVm, ...vmOverrides })
    return render(
        <CardDetailDrawer
            item={mockItem}
            isOpen={true}
            onClose={vi.fn()}
            onUpdate={vi.fn()}
            onDelete={vi.fn()}
            {...propOverrides}
        />
    )
}

describe('CardDetailDrawer', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(useEditStockViewModel).mockReturnValue({ ...defaultVm })
    })

    it('exibe o nome e edicao da carta em modo visualizacao', () => {
        renderDrawer()

        expect(screen.getByText('Lightning Bolt')).toBeDefined()
        expect(screen.getByText('Limited Edition Alpha')).toBeDefined()
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
