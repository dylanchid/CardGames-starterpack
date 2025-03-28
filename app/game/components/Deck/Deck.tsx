import React from 'react';
import { motion } from 'framer-motion';
import { z } from 'zod';

const CardSchema = z.object({
  suit: z.string(),
  rank: z.string(),
});

const DeckSchema = z.object({
  cards: z.array(CardSchema),
  isDeckEmpty: z.boolean().optional(),
  onDraw: z.function().args(z.void()).returns(z.void()).optional(),
});

type DeckProps = z.infer<typeof DeckSchema>;

export const Deck: React.FC<DeckProps> = ({ cards, isDeckEmpty = false, onDraw }) => {
  return (
    <motion.div
      className="relative w-24 h-36"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {cards.map((card, index) => (
        <motion.div
          key={`${card.suit}-${card.rank}-${index}`}
          className="absolute w-full h-full bg-white rounded-lg shadow-lg"
          style={{
            transform: `translateY(${index * 2}px)`,
            zIndex: cards.length - index,
          }}
        />
      ))}
      {isDeckEmpty ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
          <span className="text-gray-400 text-sm">Empty</span>
        </div>
      ) : (
        <button
          className="absolute inset-0 w-full h-full bg-blue-500 rounded-lg shadow-lg opacity-0 hover:opacity-20 transition-opacity duration-200"
          onClick={onDraw}
        />
      )}
    </motion.div>
  );
}; 