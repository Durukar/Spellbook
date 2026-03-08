export interface ScryfallSet {
    object: 'set';
    id: string;
    code: string;
    name: string;
    uri: string;
    scryfall_uri: string;
    search_uri: string;
    released_at: string;
    set_type: string;
    card_count: number;
    digital: boolean;
    nonfoil_only: boolean;
    foil_only: boolean;
    icon_svg_uri: string;
}

export interface ScryfallSetList {
    object: 'list';
    has_more: boolean;
    data: ScryfallSet[];
}

export interface ScryfallCardPrices {
    usd: string | null;
    usd_foil: string | null;
    eur: string | null;
    eur_foil: string | null;
}

export interface ScryfallCard {
    object: 'card';
    id: string;
    name: string;
    set: string;
    set_name: string;
    collector_number: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'mythic' | 'special' | 'bonus';
    prices: ScryfallCardPrices;
    image_uris?: {
        small: string;
        normal: string;
        large: string;
        art_crop: string;
        border_crop: string;
    };
    released_at: string;
    lang: string;
}

export interface ScryfallCardList {
    object: 'list';
    has_more: boolean;
    next_page?: string;
    total_cards: number;
    data: ScryfallCard[];
}
