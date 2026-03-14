import { useState, useEffect } from 'react';
import { stockService } from '../services/stockService';
import { scryfallService } from '../services/scryfallService';
import type { ScryfallCard } from '../types/scryfall';
import type { CardCondition } from '../models/Stock';
import type { PriceCurrency } from '../types/stock';

function getScryfallPrice(card: ScryfallCard | null, foil: boolean): string {
    if (!card) return '';
    if (foil) return card.prices?.usd_foil ?? card.prices?.usd ?? card.prices?.eur ?? '';
    return card.prices?.usd ?? card.prices?.eur ?? '';
}

export function useAddStockViewModel(initialCard: ScryfallCard | null) {
    const [selectedCard, setSelectedCard] = useState<ScryfallCard | null>(initialCard);
    const [printings, setPrintings] = useState<ScryfallCard[]>(initialCard ? [initialCard] : []);

    const [useScryfall, setUseScryfall] = useState<boolean>(true);
    const [price, setPrice] = useState<string>(getScryfallPrice(initialCard, false));
    const [priceCurrency, setPriceCurrency] = useState<PriceCurrency>('USD');
    const [condition, setCondition] = useState<CardCondition>('NM');
    const [quantity, setQuantity] = useState<string>('1');
    const [isFoil, setIsFoil] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!initialCard) return;

        let isMounted = true;

        scryfallService.searchCardsExactName(initialCard.name)
            .then(res => {
                if (!isMounted) return;
                const fetchedPrintings = res.data || [];
                const hasInitial = fetchedPrintings.some(p => p.id === initialCard.id);
                setPrintings(hasInitial ? fetchedPrintings : [initialCard, ...fetchedPrintings]);
            })
            .catch(err => {
                if (!isMounted) return;
                console.error("Failed to fetch printings:", err);
                setPrintings([initialCard]);
            });

        return () => { isMounted = false; };
    }, [initialCard]);

    const handleSetSelectedCard = (card: ScryfallCard) => {
        setSelectedCard(card);
        if (useScryfall) {
            setPrice(getScryfallPrice(card, isFoil));
        }
    };

    const handleSetIsFoil = (foil: boolean) => {
        setIsFoil(foil);
        if (useScryfall && selectedCard) {
            setPrice(getScryfallPrice(selectedCard, foil));
        }
    };

    const handleSetUseScryfall = (value: boolean) => {
        setUseScryfall(value);
        if (value) {
            setPrice(getScryfallPrice(selectedCard, isFoil));
            setPriceCurrency('USD');
        } else {
            setPrice('');
            setPriceCurrency('BRL');
        }
    };

    const handleSetPrice = (value: string) => {
        setPrice(value);
    };

    const saveStockItem = async (): Promise<boolean> => {
        if (!selectedCard) {
            setError('Nenhuma carta selecionada.');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            await stockService.addStockItem({
                scryfallId: selectedCard.id,
                cardName: selectedCard.name,
                setName: selectedCard.set_name,
                imageUrl: selectedCard.image_uris?.normal ?? selectedCard.card_faces?.[0]?.image_uris?.normal ?? '',
                purchasePrice: parseFloat(price) || 0,
                priceCurrency,
                condition,
                quantity: parseInt(quantity) || 1,
                ...(isFoil ? { isFoil } : {}),
            });

            setIsLoading(false);
            return true;
        } catch (err) {
            console.error(err);
            setError('Failed to save card to stock.');
            setIsLoading(false);
            return false;
        }
    };

    return {
        selectedCard,
        setSelectedCard: handleSetSelectedCard,
        printings,
        useScryfall,
        setUseScryfall: handleSetUseScryfall,
        price,
        setPrice: handleSetPrice,
        priceCurrency,
        condition,
        setCondition,
        quantity,
        setQuantity,
        isFoil,
        setIsFoil: handleSetIsFoil,
        isLoading,
        error,
        saveStockItem,
    };
}
