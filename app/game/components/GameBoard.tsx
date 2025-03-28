/**
 * @fileoverview Game board component that displays the game state
 */

import { useGame } from './core/GameContext';
import { useBidding } from './features/bidding/BiddingProvider';
import { useCardPlay } from './features/cardPlay/CardPlayProvider';
import PlayerHand from './PlayerHand';
import BiddingPanel from './features/bidding/BiddingPanel';
import CardPlayArea from './features/cardPlay/CardPlayArea';
import GameInfo from './GameInfo';

export default function GameBoard() {
  const { gameState, startGame, startNewRound } = useGame();
  const { biddingState, startBidding, completeBidding } = useBidding();
  const { cardPlayState, initializeNewTrick } = useCardPlay();

  const renderGamePhase = () => {
    switch (gameState.gamePhase) {
      case 'setup':
        return (
          <div className="flex flex-col items-center justify-center space-y-4 p-8">
            <h2 className="text-2xl font-bold">Game Setup</h2>
            <button
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              onClick={() => startGame()}
            >
              Start Game
            </button>
          </div>
        );
      
      case 'dealing':
        return (
          <div className="flex flex-col items-center justify-center space-y-4 p-8">
            <h2 className="text-2xl font-bold">Dealing Cards</h2>
            <p>Round {gameState.roundNumber}</p>
            <button
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              onClick={() => startBidding()}
            >
              Start Bidding
            </button>
          </div>
        );
      
      case 'bidding':
        return (
          <div className="flex flex-col space-y-4">
            <h2 className="text-2xl font-bold">Bidding Phase</h2>
            <BiddingPanel />
            {biddingState.allBidsRevealed && (
              <button
                className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                onClick={() => completeBidding()}
              >
                Start Playing
              </button>
            )}
          </div>
        );
      
      case 'playing':
        return (
          <div className="flex flex-col space-y-4">
            <h2 className="text-2xl font-bold">Playing Phase</h2>
            <CardPlayArea />
            {cardPlayState.trickComplete && (
              <button
                className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                onClick={() => initializeNewTrick()}
              >
                Next Trick
              </button>
            )}
          </div>
        );
      
      case 'scoring':
        return (
          <div className="flex flex-col items-center justify-center space-y-4 p-8">
            <h2 className="text-2xl font-bold">Game Complete</h2>
            <p>Final Scores</p>
            <button
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              onClick={() => startNewRound()}
            >
              Play Another Round
            </button>
          </div>
        );
      
      default:
        return <div>Unknown game phase</div>;
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <GameInfo />
      
      <div className="rounded-lg bg-white p-6 shadow-md">
        {renderGamePhase()}
      </div>
      
      <PlayerHand />
      
      {gameState.error && (
        <div className="mt-4 rounded-md bg-red-100 p-4 text-red-700">
          <p className="font-bold">Error:</p>
          <p>{gameState.error.message}</p>
        </div>
      )}
    </div>
  );
} 