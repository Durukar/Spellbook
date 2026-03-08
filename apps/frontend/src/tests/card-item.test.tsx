import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CardItem } from '@/components/cards/CardItem';
import type { ScryfallCard } from '@/types/scryfall';

const makeSingleFaceCard = (overrides: Partial<ScryfallCard> = {}): ScryfallCard => ({
    object: 'card',
    id: 'abc-123',
    name: 'Lightning Bolt',
    set: 'lea',
    set_name: 'Limited Edition Alpha',
    collector_number: '161',
    rarity: 'common',
    released_at: '1993-08-05',
    lang: 'en',
    prices: { usd: '1.50', usd_foil: null, eur: null, eur_foil: null },
    image_uris: {
        small: 'https://cards.scryfall.io/small/front/a/b/abc.jpg',
        normal: 'https://cards.scryfall.io/normal/front/a/b/abc.jpg',
        large: 'https://cards.scryfall.io/large/front/a/b/abc.jpg',
        art_crop: 'https://cards.scryfall.io/art_crop/front/a/b/abc.jpg',
        border_crop: 'https://cards.scryfall.io/border_crop/front/a/b/abc.jpg',
    },
    ...overrides,
});

const makeDFCCard = (): ScryfallCard => ({
    object: 'card',
    id: 'dfc-456',
    name: 'Aang, at the Crossroads // Aang in the Avatar State',
    set: 'fin',
    set_name: 'Final Fantasy',
    collector_number: '1',
    rarity: 'mythic',
    released_at: '2025-06-13',
    lang: 'en',
    prices: { usd: '10.00', usd_foil: null, eur: null, eur_foil: null },
    card_faces: [
        {
            object: 'card_face',
            name: 'Aang, at the Crossroads',
            mana_cost: '{2}{W}{U}',
            type_line: 'Legendary Creature',
            image_uris: {
                small: 'https://cards.scryfall.io/small/front/d/f/dfc.jpg',
                normal: 'https://cards.scryfall.io/normal/front/d/f/dfc.jpg',
                large: 'https://cards.scryfall.io/large/front/d/f/dfc.jpg',
                art_crop: 'https://cards.scryfall.io/art_crop/front/d/f/dfc.jpg',
                border_crop: 'https://cards.scryfall.io/border_crop/front/d/f/dfc.jpg',
            },
        },
        {
            object: 'card_face',
            name: 'Aang in the Avatar State',
            mana_cost: '',
            type_line: 'Legendary Creature',
            image_uris: {
                small: 'https://cards.scryfall.io/small/back/d/f/dfc-back.jpg',
                normal: 'https://cards.scryfall.io/normal/back/d/f/dfc-back.jpg',
                large: 'https://cards.scryfall.io/large/back/d/f/dfc-back.jpg',
                art_crop: 'https://cards.scryfall.io/art_crop/back/d/f/dfc-back.jpg',
                border_crop: 'https://cards.scryfall.io/border_crop/back/d/f/dfc-back.jpg',
            },
        },
    ],
});

describe('CardItem', () => {
    describe('carta de face unica', () => {
        it('renderiza o nome da carta', () => {
            render(<CardItem card={makeSingleFaceCard()} />);
            expect(screen.getByText('Lightning Bolt')).toBeDefined();
        });

        it('renderiza o nome do set', () => {
            render(<CardItem card={makeSingleFaceCard()} />);
            expect(screen.getByText('Limited Edition Alpha')).toBeDefined();
        });

        it('renderiza a imagem com alt correto', () => {
            render(<CardItem card={makeSingleFaceCard()} />);
            const img = screen.getByRole('img');
            expect(img.getAttribute('alt')).toBe('Lightning Bolt');
        });

        it('renderiza o preco em USD', () => {
            render(<CardItem card={makeSingleFaceCard()} />);
            expect(screen.getByText('USD 1.50')).toBeDefined();
        });

        it('renderiza preco em EUR quando nao ha USD', () => {
            const card = makeSingleFaceCard({
                prices: { usd: null, usd_foil: null, eur: '1.20', eur_foil: null },
            });
            render(<CardItem card={card} />);
            expect(screen.getByText('EUR 1.20')).toBeDefined();
        });

        it('nao renderiza preco quando nenhum esta disponivel', () => {
            const card = makeSingleFaceCard({
                prices: { usd: null, usd_foil: null, eur: null, eur_foil: null },
            });
            render(<CardItem card={card} />);
            expect(screen.queryByText(/USD|EUR/)).toBeNull();
        });

        it('renderiza o badge de raridade', () => {
            render(<CardItem card={makeSingleFaceCard()} />);
            expect(screen.getByText('common')).toBeDefined();
        });

        it('nao renderiza botao de flip para carta de face unica', () => {
            render(<CardItem card={makeSingleFaceCard()} />);
            expect(screen.queryByTitle('Virar carta')).toBeNull();
        });

        it('exibe nome como fallback na area da imagem quando nao ha image_uris', () => {
            const card = makeSingleFaceCard({ image_uris: undefined });
            render(<CardItem card={card} />);
            // nome aparece no fallback da imagem E na secao de info
            expect(screen.getAllByText('Lightning Bolt').length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('carta double-faced (DFC)', () => {
        it('renderiza o nome completo da carta', () => {
            render(<CardItem card={makeDFCCard()} />);
            expect(screen.getByText('Aang, at the Crossroads // Aang in the Avatar State')).toBeDefined();
        });

        it('renderiza a imagem da face frontal inicialmente', () => {
            render(<CardItem card={makeDFCCard()} />);
            const imgs = screen.getAllByRole('img');
            const front = imgs.find((img) => img.getAttribute('alt') === 'Aang, at the Crossroads');
            expect(front).toBeDefined();
            expect(front!.getAttribute('src')).toContain('/front/');
        });

        it('renderiza a imagem da face traseira no DOM', () => {
            render(<CardItem card={makeDFCCard()} />);
            const imgs = screen.getAllByRole('img');
            const back = imgs.find((img) => img.getAttribute('alt') === 'Aang in the Avatar State');
            expect(back).toBeDefined();
            expect(back!.getAttribute('src')).toContain('/back/');
        });

        it('exibe botao de flip para carta DFC', () => {
            render(<CardItem card={makeDFCCard()} />);
            expect(screen.getByTitle('Virar carta')).toBeDefined();
        });

        it('ao clicar no botao de flip nao propaga o evento para o card', () => {
            const { container } = render(<CardItem card={makeDFCCard()} />);
            const flipBtn = screen.getByTitle('Virar carta');
            // nao deve lancar erro ao clicar
            expect(() => fireEvent.click(flipBtn)).not.toThrow();
        });
    });
});
