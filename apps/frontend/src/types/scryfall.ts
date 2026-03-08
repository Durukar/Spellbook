export type ScryfallColor = 'W' | 'U' | 'B' | 'R' | 'G';

export type ScryfallLegalityStatus = 'legal' | 'not_legal' | 'restricted' | 'banned';

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

export interface ScryfallImageUris {
    small: string;
    normal: string;
    large: string;
    art_crop: string;
    border_crop: string;
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
    image_uris?: ScryfallImageUris;
    card_faces?: ScryfallCardFace[];
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

export interface ScryfallCardLegalities {
    standard: ScryfallLegalityStatus;
    pioneer: ScryfallLegalityStatus;
    modern: ScryfallLegalityStatus;
    legacy: ScryfallLegalityStatus;
    vintage: ScryfallLegalityStatus;
    commander: ScryfallLegalityStatus;
    pauper: ScryfallLegalityStatus;
}

export interface ScryfallCardFace {
    object: 'card_face';
    name: string;
    mana_cost: string;
    type_line: string;
    oracle_text?: string;
    colors?: ScryfallColor[];
    power?: string;
    toughness?: string;
    image_uris?: ScryfallImageUris;
}

export interface ScryfallCardDetail extends ScryfallCard {
    oracle_text?: string;
    type_line: string;
    mana_cost?: string;
    cmc: number;
    colors?: ScryfallColor[];
    color_identity: ScryfallColor[];
    legalities: ScryfallCardLegalities;
    power?: string;
    toughness?: string;
    loyalty?: string;
    keywords: string[];
    rulings_uri: string;
    prints_search_uri: string;
    artist?: string;
    flavor_text?: string;
    card_faces?: ScryfallCardFace[];
}

export interface ScryfallAutocompleteResult {
    object: 'catalog';
    total_values: number;
    data: string[];
}
