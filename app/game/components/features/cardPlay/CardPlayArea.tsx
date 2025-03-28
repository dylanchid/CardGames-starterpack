/**
 * @fileoverview Card play area component for the playing phase
 */

import { useCardPlay } from './CardPlayProvider';
import { useGame } from '../../core/GameContext';
import Card from '../../Card';

export default function CardPlayArea() {
  const { gameState } = useGame();
  const { cardPlayState } = useCardPlay();
  
  // This would come from actual game state
  const trickCards = cardPlayState.currentTrick || [];
  const currentPlayerIndex = gameState.currentPlayerIndex;
  
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-xl font-semibold">Current Trick</h3>
      
      {trickCards.length === 0 ? (
        <p className="text-gray-500">Waiting for the first card to be played...</p>
      ) : (
        <div className="flex justify-center">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {/* This would map over actual played cards */}
            {trickCards.map((cardData, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="relative">
                  <Card card={cardData.card} />
                  {gameState.currentTrickLeader === cardData.playerIndex && (
                    <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500 text-white">
                      L
                    </div>
                  )}
                </div>
                <p className="mt-2 text-sm font-medium text-gray-700">
                  {cardData.playerIndex === currentPlayerIndex ? 'You' : `Player ${cardData.playerIndex + 1}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-6">
        <h4 className="mb-2 text-lg font-medium">Trick History</h4>
        {gameState.trickHistory && gameState.trickHistory.length > 0 ? (
          <div className="max-h-40 overflow-y-auto">
            <ul className="space-y-2">
              {gameState.trickHistory.map((trick, index) => (
                <li key={index} className="rounded bg-gray-50 p-2">
                  <p className="text-sm">
                    <span className="font-semibold">Trick {index + 1}:</span> 
                    Won by Player {trick.winnerIndex + 1}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-500">No tricks played yet.</p>
        )}
      </div>
      
      <div className="mt-6">
        <h4 className="mb-2 text-lg font-medium">Turn</h4>
        <p className="text-gray-700">
          Current player: {currentPlayerIndex === 0 ? 'You' : `Player ${currentPlayerIndex + 1}`}
        </p>
        {gameState.gamePhase === 'playing' && (
          <p className="mt-2 text-sm text-gray-500">
            {currentPlayerIndex === 0 
              ? 'It\'s your turn. Play a card from your hand.'
              : `Waiting for Player ${currentPlayerIndex + 1} to play a card...`}
          </p>
        )}
      </div>
    </div>
  );
} 