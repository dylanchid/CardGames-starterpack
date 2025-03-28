/**
 * @fileoverview Bidding panel component for the bidding phase
 */

import { useState } from 'react';
import { useBidding } from './BiddingProvider';
import { useGame } from '../../core/GameContext';

export default function BiddingPanel() {
  const { gameState } = useGame();
  const { placeBid, revealBid, getBidForPlayer, getPlayerBidStatus } = useBidding();
  const [bidValue, setBidValue] = useState<number>(0);
  
  // This would come from authentication/session
  const currentPlayerId = 'current_player_id';
  
  // Check if it's the current player's turn to bid
  const isPlayerTurn = gameState.currentPlayerIndex === 0; // Simplified; use actual index logic
  
  // Get the current player's bid status
  const hasBid = getPlayerBidStatus(currentPlayerId).hasMadeBid;
  const hasRevealedBid = getPlayerBidStatus(currentPlayerId).hasRevealedBid;
  
  const handlePlaceBid = () => {
    placeBid(currentPlayerId, bidValue);
  };
  
  const handleRevealBid = () => {
    revealBid(currentPlayerId);
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-xl font-semibold">Bidding</h3>
      
      {!hasBid && isPlayerTurn && (
        <div className="flex items-center space-x-4">
          <div>
            <label htmlFor="bid-value" className="block text-sm font-medium text-gray-700">
              Your Bid
            </label>
            <input
              type="number"
              id="bid-value"
              min={0}
              max={gameState.roundNumber}
              value={bidValue}
              onChange={(e) => setBidValue(parseInt(e.target.value, 10))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          
          <button
            onClick={handlePlaceBid}
            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Place Bid
          </button>
        </div>
      )}
      
      {hasBid && !hasRevealedBid && (
        <div className="flex items-center space-x-4">
          <p className="text-gray-700">
            You have placed your bid.
          </p>
          <button
            onClick={handleRevealBid}
            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Reveal Bid
          </button>
        </div>
      )}
      
      {hasRevealedBid && (
        <p className="text-gray-700">
          Your bid: <span className="font-semibold">{getBidForPlayer(currentPlayerId)?.bidValue || 0}</span>
        </p>
      )}
      
      <div className="mt-6">
        <h4 className="mb-2 text-lg font-medium">All Bids</h4>
        <div className="space-y-2">
          {/* This would display all player bids */}
          <p className="text-gray-500">Waiting for all players to reveal their bids...</p>
        </div>
      </div>
    </div>
  );
} 