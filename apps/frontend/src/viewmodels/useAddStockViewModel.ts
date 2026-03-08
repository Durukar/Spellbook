import { useState, useEffect } from 'react';
import { stockService } from '../services/stockService';
import { scryfallService } from '../services/scryfallService';
import type { ScryfallCard } from '../types/scryfall';
import type { CardCondition } from '../models/Stock';

export function useAddStockViewModel(initialCard: ScryfallCard | null) {
    // Determine initial state values directly to avoid cascading renders in useEffect
    const initialPrice = initialCard?.prices?.usd ?? initialCard?.prices?.eur ?? '';

    const [selectedCard, setSelectedCard] = useState<ScryfallCard | null>(initialCard);
    const [printings, setPrintings] = useState<ScryfallCard[]>(initialCard ? [initialCard] : []);

    const [price, setPrice] = useState<string>(initialPrice);
    const [condition, setCondition] = useState<CardCondition>('NM');
    const [quantity, setQuantity] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch printings when initialCard changes
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

    // When the user selects a new printing manually, update the price
    const handleSetSelectedCard = (card: ScryfallCard) => {
        setSelectedCard(card);
        const newPrice = card.prices?.usd ?? card.prices?.eur ?? '';
        setPrice(newPrice);
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
                condition,
                quantity,
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
        setSelectedCard: handleSetSelectedCard, // keep external API the same but use the new handler
        printings,
        price,
        setPrice,
        condition,
        setCondition,
        quantity,
        setQuantity,
        isLoading,
        error,
        saveStockItem,
    };
}
