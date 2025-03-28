/**
 * @fileoverview Bidding provider component
 */

'use client';

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/game/store/store';
import { placeBidAction, revealBidAction } from '@/app/game/store/gameThunks';
import { 
  selectBiddingState, 
  selectBids, 
  selectCurrentBidder, 
  selectBidPhaseComplete, 
  selectRevealPhaseActive,
  selectBidByPlayerId,
  selectAllPlayersHaveBid,
  selectPlayerBidStatus,
  selectAllBidsRevealed
} from '@/app/game/store/slices/bidding/biddingSelectors';
import { CardType } from '@/app/game/types/card';
import { startBidding, completeBiddingPhase } from '@/app/game/store/slices/bidding/biddingSlice';
import { selectAllPlayers } from '@/app/game/store/slices/player/playerSelectors';

/**
 * Bidding context interface
 */
interface BiddingContextValue {
  // Bidding state
  currentBidder: string | null;
  isBidPhaseComplete: boolean;
  isRevealPhaseActive: boolean;
  allPlayersHaveBid: boolean;
  allBidsRevealed: boolean;
  
  // Bidding actions
  placeBid: (playerId: string, bidCards: CardType[]) => Promise<void>;
  revealBid: (playerId: string) => Promise<void>;
  startBidding: (playerIds: string[]) => void;
  completeBidding: () => void;
  
  // Bidding queries
  getBidForPlayer: (playerId: string) => { 
    cardIds: string[]; 
    revealed: boolean; 
  } | null;
  getPlayerBidStatus: () => Array<{ 
    playerId: string; 
    hasBid: boolean; 
    bid: any; 
  }>;
}

// Create context
const BiddingContext = createContext<BiddingContextValue | undefined>(undefined);

/**
 * Props for BiddingProvider
 */
interface BiddingProviderProps {
  children: ReactNode;
}

/**
 * Bidding provider component
 */
export function BiddingProvider({ children }: BiddingProviderProps) {
  const dispatch = useAppDispatch();
  
  // Selectors
  const biddingState = useAppSelector(selectBiddingState);
  const bids = useAppSelector(selectBids);
  const currentBidder = useAppSelector(selectCurrentBidder);
  const bidPhaseComplete = useAppSelector(selectBidPhaseComplete);
  const revealPhaseActive = useAppSelector(selectRevealPhaseActive);
  const allPlayersHaveBid = useAppSelector(selectAllPlayersHaveBid);
  const playerBidStatus = useAppSelector(selectPlayerBidStatus);
  const allBidsRevealed = useAppSelector(selectAllBidsRevealed);
  const players = useAppSelector(selectAllPlayers);
  
  // Bidding actions
  const handlePlaceBid = async (playerId: string, bidCards: CardType[]) => {
    await dispatch(placeBidAction({ playerId, bidCards }));
  };
  
  const handleRevealBid = async (playerId: string) => {
    await dispatch(revealBidAction(playerId));
  };
  
  const handleStartBidding = (playerIds: string[]) => {
    dispatch(startBidding(playerIds));
  };
  
  const handleCompleteBidding = () => {
    dispatch(completeBiddingPhase());
  };
  
  // Bidding queries
  const getBidForPlayer = (playerId: string) => {
    const bid = bids[playerId];
    if (!bid) return null;
    
    return {
      cardIds: bid.cardIds,
      revealed: bid.revealed,
    };
  };
  
  // Create context value
  const contextValue = useMemo<BiddingContextValue>(() => ({
    // Bidding state
    currentBidder,
    isBidPhaseComplete: bidPhaseComplete,
    isRevealPhaseActive: revealPhaseActive,
    allPlayersHaveBid,
    allBidsRevealed,
    
    // Bidding actions
    placeBid: handlePlaceBid,
    revealBid: handleRevealBid,
    startBidding: handleStartBidding,
    completeBidding: handleCompleteBidding,
    
    // Bidding queries
    getBidForPlayer,
    getPlayerBidStatus: () => playerBidStatus,
  }), [
    currentBidder,
    bidPhaseComplete,
    revealPhaseActive,
    allPlayersHaveBid,
    playerBidStatus,
    allBidsRevealed,
    bids,
  ]);
  
  return (
    <BiddingContext.Provider value={contextValue}>
      {children}
    </BiddingContext.Provider>
  );
}

/**
 * Hook to use the bidding context
 */
export function useBidding() {
  const context = useContext(BiddingContext);
  
  if (context === undefined) {
    throw new Error('useBidding must be used within a BiddingProvider');
  }
  
  return context;
} 