/**
 * @fileoverview Game information component
 */

import { useGame } from './core/GameContext';

export default function GameInfo() {
  const { gameState } = useGame();

  return (
    <div className="rounded-lg bg-gray-100 p-4 shadow">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <h3 className="font-semibold text-gray-700">Phase</h3>
          <p className="text-lg capitalize">{gameState.gamePhase}</p>
        </div>
        
        <div>
          <h3 className="font-semibold text-gray-700">Round</h3>
          <p className="text-lg">{gameState.roundNumber}</p>
        </div>
        
        <div>
          <h3 className="font-semibold text-gray-700">Tricks Played</h3>
          <p className="text-lg">{gameState.tricksPlayed}</p>
        </div>
      </div>
      
      {gameState.turnupCard && (
        <div className="mt-4">
          <h3 className="font-semibold text-gray-700">Trump Card</h3>
          <div className="mt-1 inline-block rounded border border-gray-300 bg-white p-2 shadow-sm">
            {gameState.turnupCard.suit} {gameState.turnupCard.rank}
          </div>
        </div>
      )}
      
      {gameState.lastAction && (
        <div className="mt-4">
          <h3 className="font-semibold text-gray-700">Last Action</h3>
          <p className="italic text-gray-600">{gameState.lastAction}</p>
        </div>
      )}
    </div>
  );
} 