export type CardCondition = 'NM' | 'SP' | 'MP' | 'HP' | 'DMG';
export type PriceCurrency = 'USD' | 'BRL';

export interface StockItem {
    id: string;
    scryfallId: string;
    cardName: string;
    setName: string;
    imageUrl: string;
    purchasePrice: number;
    priceCurrency: PriceCurrency;
    purchaseDate: string;
    condition: CardCondition;
    quantity: number;
    isFoil?: boolean;
}
