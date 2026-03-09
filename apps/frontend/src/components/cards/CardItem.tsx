import { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AddStockSheet } from '../stock/AddStockSheet';
import type { ScryfallCard } from '@/types/scryfall';

const RARITY_COLORS: Record<ScryfallCard['rarity'], string> = {
    common: 'bg-zinc-600 text-zinc-200',
    uncommon: 'bg-blue-700 text-blue-100',
    rare: 'bg-yellow-600 text-yellow-100',
    mythic: 'bg-orange-600 text-orange-100',
    special: 'bg-purple-600 text-purple-100',
    bonus: 'bg-pink-600 text-pink-100',
};

interface CardItemProps {
    card: ScryfallCard;
}

export function CardItem({ card }: CardItemProps) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isAddStockOpen, setIsAddStockOpen] = useState(false);

    const frontImage = card.image_uris?.normal ?? card.card_faces?.[0]?.image_uris?.normal;
    const backImage = card.card_faces?.[1]?.image_uris?.normal;
    const isDFC = Boolean(backImage);

    const price = card.prices.usd ?? card.prices.eur ?? null;
    const currency = card.prices.usd ? 'USD' : card.prices.eur ? 'EUR' : null;

    const handleFlip = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsFlipped((prev) => !prev);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="group relative flex flex-col rounded-xl bg-card border border-border overflow-hidden cursor-pointer shadow-sm hover:shadow-lg hover:border-primary/30 transition-shadow"
            onClick={() => setIsAddStockOpen(true)}
        >
            {/* Image area */}
            <div
                className="relative aspect-[2.5/3.5] w-full bg-muted"
                style={{ perspective: '800px' }}
            >
                <motion.div
                    className="relative w-full h-full"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.55, type: 'spring', stiffness: 260, damping: 28 }}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Face frontal */}
                    <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
                        {frontImage ? (
                            <img
                                src={frontImage}
                                alt={card.card_faces?.[0]?.name ?? card.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="text-muted-foreground text-xs text-center px-2">
                                    {card.name}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Face traseira (DFC) */}
                    {isDFC && (
                        <div
                            className="absolute inset-0"
                            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                        >
                            <img
                                src={backImage!}
                                alt={card.card_faces?.[1]?.name ?? card.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        </div>
                    )}
                </motion.div>

                {/* Rarity badge */}
                <div className="absolute top-2 right-2 z-10">
                    <Badge
                        className={`text-[10px] font-semibold capitalize px-1.5 py-0.5 ${RARITY_COLORS[card.rarity]}`}
                    >
                        {card.rarity}
                    </Badge>
                </div>

                {/* Botao de flip — visivel no hover, apenas para DFCs */}
                {isDFC && (
                    <button
                        onClick={handleFlip}
                        className="absolute bottom-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 hover:bg-black/80 rounded-full p-1.5 text-white"
                        title="Virar carta"
                    >
                        <motion.div
                            animate={{ rotate: isFlipped ? 180 : 0 }}
                            transition={{ duration: 0.55, type: 'spring', stiffness: 260, damping: 28 }}
                        >
                            <RefreshCw className="w-3 h-3" />
                        </motion.div>
                    </button>
                )}
            </div>

            <div className="p-3 flex flex-col gap-1">
                <p className="text-sm font-semibold text-foreground leading-tight line-clamp-1">
                    {card.name}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1">{card.set_name}</p>
                <div className="flex items-center mt-1">
                    {price && currency ? (
                        <p className="text-xs font-mono font-bold text-primary">
                            {currency} {parseFloat(price).toFixed(2)}
                        </p>
                    ) : (
                        <p className="text-xs text-muted-foreground italic">Sem preço</p>
                    )}
                </div>
            </div>

            <AddStockSheet
                card={card}
                isOpen={isAddStockOpen}
                onClose={() => setIsAddStockOpen(false)}
            />
        </motion.div>
    );
}
