export type CardCondition = 'NM' | 'SP' | 'MP' | 'HP' | 'DMG';

export interface StockItem {
    id: string; // UUID interno gerado no Front para controle local
    scryfallId: string; // ID oficial da carta no Scryfall
    cardName: string;
    setName: string;
    imageUrl: string;
    purchasePrice: number; // Valor pago na aquisição
    purchaseDate: string; // Data da aquisiçao em formato ISO
    condition: CardCondition;
    quantity: number;
}
