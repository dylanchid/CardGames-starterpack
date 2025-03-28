import React from 'react';
import { CardType } from '../../types/card';
import { Card } from '../Card/Card';
import './PlayerHand.css';

interface PlayerHandProps {
  cards: CardType[];
  onCardClick: (card: CardType) => void;
  selectedCards: CardType[];
  disabled: boolean;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  cards,
  onCardClick,
  selectedCards,
  disabled,
}) => {
  return (
    <div className="player-hand">
      {cards.map((card, index) => (
        <Card
          key={card.id}
          card={card}
          onClick={() => !disabled && onCardClick(card)}
          disabled={disabled}
          selected={selectedCards.some(c => c.id === card.id)}
          style={{
            position: 'relative',
            zIndex: index,
            transform: `translateX(${index * 30}px)`,
          }}
        />
      ))}
    </div>
  );
}; 