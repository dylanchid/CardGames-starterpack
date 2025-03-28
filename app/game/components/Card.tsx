/**
 * @fileoverview Card component for displaying playing cards
 */

import { Card as CardType } from '@/app/game/types/cards/CardTypes';

interface CardProps {
  card: CardType;
  disabled?: boolean;
  selected?: boolean;
  highlight?: boolean;
  onClick?: () => void;
  className?: string;
}

// Map of suit to emoji symbols
const SUIT_SYMBOLS: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

// Map of suit to colors
const SUIT_COLORS: Record<string, string> = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-black',
  spades: 'text-black',
};

export default function Card({
  card,
  disabled = false,
  selected = false,
  highlight = false,
  onClick,
  className = '',
}: CardProps) {
  const suitSymbol = SUIT_SYMBOLS[card.suit] || card.suit;
  const suitColor = SUIT_COLORS[card.suit] || 'text-black';
  
  return (
    <div
      className={`
        relative h-32 w-24 cursor-pointer rounded-lg border-2 bg-white p-2 shadow
        ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:shadow-lg'}
        ${selected ? 'border-blue-500' : 'border-gray-300'}
        ${highlight ? 'ring-2 ring-yellow-400' : ''}
        ${suitColor}
        ${className}
      `}
      onClick={disabled ? undefined : onClick}
    >
      <div className="flex h-full flex-col justify-between">
        <div className="text-left text-lg font-bold">{card.rank}</div>
        
        <div className="flex-grow text-center text-4xl">
          {suitSymbol}
        </div>
        
        <div className="text-right text-lg font-bold rotate-180">
          {card.rank}
        </div>
      </div>
    </div>
  );
} 