export type CardCondition = 'NM' | 'SP' | 'MP' | 'HP' | 'DMG';

export interface StockItem {
    id: string;
    scryfallId: string;
    cardName: string;
    setName: string;
    imageUrl: string;
    purchasePrice: number;
    purchaseDate: string;
    condition: CardCondition;
    quantity: number;
    isFoil?: boolean;
}
