/**
 * @fileoverview Selectors for bidding state
 */

import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../store';

// Basic selectors
export const selectBiddingState = (state: RootState) => state.bidding;
export const selectBids = (state: RootState) => state.bidding.bids;
export const selectBidOrder = (state: RootState) => state.bidding.playerOrder.ids;
export const selectCurrentBidder = (state: RootState) => state.bidding.currentBidder;
export const selectBidPhaseComplete = (state: RootState) => state.bidding.bidPhaseComplete;
export const selectBidRevealOrder = (state: RootState) => state.bidding.playerOrder.ids;
export const selectRevealPhaseActive = (state: RootState) => state.bidding.revealPhaseActive;

// Parameterized selectors
export const selectBidByPlayerId = (state: RootState, playerId: string) => 
  state.bidding.bids[playerId];

export const selectBidCardIdsByPlayerId = (state: RootState, playerId: string) => 
  state.bidding.bids[playerId]?.cardIds || [];

export const selectIsBidRevealed = (state: RootState, playerId: string) => 
  state.bidding.bids[playerId]?.revealed || false;

// Combined selectors
export const selectAllBids = createSelector(
  [selectBids],
  bids => Object.values(bids)
);

export const selectBidsByPlayer = createSelector(
  [selectBids],
  bids => bids
);

export const selectAllPlayersHaveBid = createSelector(
  [selectBidOrder, selectBids],
  (bidOrder, bids) => bidOrder.every(playerId => bids[playerId] !== undefined)
);

export const selectNextBidder = createSelector(
  [selectBidOrder, selectCurrentBidder],
  (bidOrder, currentBidder) => {
    if (!currentBidder) return null;
    const currentIndex = bidOrder.indexOf(currentBidder);
    if (currentIndex === -1 || currentIndex === bidOrder.length - 1) return null;
    return bidOrder[currentIndex + 1];
  }
);

export const selectPlayerBidStatus = createSelector(
  [selectBidOrder, selectBids],
  (bidOrder, bids) => bidOrder.map(playerId => ({
    playerId,
    hasBid: bids[playerId] !== undefined,
    bid: bids[playerId],
  }))
);

export const selectAllBidsRevealed = createSelector(
  [selectBids, selectBidOrder],
  (bids, bidOrder) => 
    bidOrder.every(playerId => bids[playerId]?.revealed === true)
);

export const selectUnrevealedBidders = createSelector(
  [selectBids, selectBidOrder],
  (bids, bidOrder) => 
    bidOrder.filter(playerId => 
      bids[playerId] !== undefined && bids[playerId].revealed === false
    )
); 