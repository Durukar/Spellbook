export type CardCondition = 'NM' | 'SP' | 'MP' | 'HP' | 'DMG';

export type AcquisitionType = 'purchase' | 'accumulated' | 'gift' | 'trade';

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
    acquisitionType?: AcquisitionType;
}
