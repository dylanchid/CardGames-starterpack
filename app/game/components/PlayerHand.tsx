/**
 * @fileoverview Player hand component that displays the current player's cards
 */

import { useGame } from './core/GameContext';
import { useCardPlay } from './features/cardPlay/CardPlayProvider';
import Card from './Card';
import { Card as CardType } from '@/app/game/types/cards/CardTypes';

export default function PlayerHand() {
  const { gameState } = useGame();
  const { getValidCardsForPlayer, playCard } = useCardPlay();
  
  const isCardPlayPhase = gameState.gamePhase === 'playing';
  const currentPlayerId = 'current_player_id'; // This would come from authentication/session
  
  // Get the current player's hand from the players slice
  // This is a simplified example; in a real app, you'd use actual data from your player state
  const playerHand: CardType[] = []; // This would come from your players state
  
  const validCards = isCardPlayPhase 
    ? getValidCardsForPlayer(currentPlayerId)
    : playerHand;

  const handleCardClick = (card: CardType) => {
    if (!isCardPlayPhase) return;
    
    const isValidCard = validCards.some(validCard => validCard.id === card.id);
    if (!isValidCard) return;
    
    playCard(currentPlayerId, card);
  };

  if (playerHand.length === 0) {
    return (
      <div className="mt-6 rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-bold">Your Hand</h2>
        <p className="text-gray-500">You don't have any cards yet.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-bold">Your Hand</h2>
      
      <div className="flex flex-wrap justify-center gap-2">
        {playerHand.map(card => {
          const isValid = validCards.some(validCard => validCard.id === card.id);
          const isDisabled = isCardPlayPhase && !isValid;
          
          return (
            <div 
              key={card.id}
              className={`transition-transform ${isDisabled ? 'opacity-50' : 'hover:-translate-y-2'}`}
              onClick={() => !isDisabled && handleCardClick(card)}
            >
              <Card 
                card={card}
                disabled={isDisabled}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
} 