import React from 'react';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { Card } from '../Card/Card';
import { Suit, Rank } from '../../types/card';

const CardSchema = z.object({
  id: z.string(),
  suit: z.nativeEnum(Suit),
  rank: z.nativeEnum(Rank),
  isFaceUp: z.boolean().default(true),
  position: z.object({
    x: z.number(),
    y: z.number(),
    zIndex: z.number(),
  }),
});

const PlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  hand: z.array(CardSchema),
  bid: z.number().nullable(),
  tricksWon: z.number(),
  isActive: z.boolean(),
  onCardClick: z.function().args(CardSchema).returns(z.void()).optional(),
});

type CardType = z.infer<typeof CardSchema>;
type PlayerProps = z.infer<typeof PlayerSchema>;

export const Player: React.FC<PlayerProps> = ({
  name,
  hand,
  bid,
  tricksWon,
  isActive,
  onCardClick,
}) => {
  return (
    <motion.div
      className={`
        p-4 rounded-lg shadow-md
        ${isActive ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50'}
        transition-colors duration-200
      `}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{name}</h3>
        <div className="flex gap-2">
          <span className="text-sm text-gray-600">
            Bid: {bid !== null ? bid : '?'}
          </span>
          <span className="text-sm text-gray-600">
            Tricks: {tricksWon}
          </span>
        </div>
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-2">
        {hand.map((card: CardType, index: number) => (
          <Card
            key={`${card.suit}-${card.rank}-${index}`}
            card={card}
            onClick={() => onCardClick?.(card)}
          />
        ))}
      </div>
    </motion.div>
  );
}; 