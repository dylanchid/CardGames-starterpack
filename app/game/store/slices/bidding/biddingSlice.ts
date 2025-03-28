/**
 * @fileoverview Redux slice for managing bidding state
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BiddingState, initialBiddingState, PlaceBidPayload, RevealBidPayload } from '../../../types/features/BiddingTypes';
import { initializeGame } from '../../gameThunks';
import { setBidCards, toggleRevealBid } from '../player/playerSlice';

const biddingSlice = createSlice({
  name: 'bidding',
  initialState: initialBiddingState,
  reducers: {
    /**
     * Start bidding phase and set up bidding order
     */
    startBidding: (state, action: PayloadAction<string[]>) => {
      const playerIds = action.payload;
      
      // Reset state and use normalized approach
      state.bids = {};
      state.currentBidder = playerIds[0];
      state.bidPhaseComplete = false;
      state.revealPhaseActive = false;
      
      // Store player order as a normalized relationship
      state.playerOrder = {
        entities: {},
        ids: [...playerIds],
      };
      
      playerIds.forEach((id, index) => {
        state.playerOrder.entities[id] = {
          id,
          bidPosition: index,
          revealPosition: index,
        };
      });
    },
    
    /**
     * Place a bid
     */
    placeBid: (state, action: PayloadAction<PlaceBidPayload>) => {
      const { playerId, bidCards } = action.payload;
      
      // Add bid to state
      state.bids[playerId] = {
        playerId,
        cardIds: bidCards.map(card => card.id),
        revealed: false,
        timestamp: Date.now(),
      };
      
      // Move to next bidder or complete phase
      const playerIds = state.playerOrder.ids;
      const currentIndex = playerIds.indexOf(playerId);
      
      if (currentIndex === playerIds.length - 1) {
        // Last player has bid
        state.bidPhaseComplete = true;
        state.currentBidder = null;
      } else {
        // Move to next player
        state.currentBidder = playerIds[currentIndex + 1];
      }
    },
    
    /**
     * Start the bid reveal phase
     */
    startBidReveal: (state) => {
      if (!state.bidPhaseComplete) {
        return;
      }
      
      state.revealPhaseActive = true;
      state.currentBidder = state.playerOrder.ids[0];
    },
    
    /**
     * Reveal a player's bid
     */
    revealBid: (state, action: PayloadAction<RevealBidPayload>) => {
      const { playerId } = action.payload;
      
      if (!state.revealPhaseActive || !state.bids[playerId]) {
        return;
      }
      
      // Mark bid as revealed
      state.bids[playerId].revealed = true;
      
      // Move to next player for revealing or complete phase
      const playerIds = state.playerOrder.ids;
      const currentIndex = playerIds.indexOf(playerId);
      
      if (currentIndex === playerIds.length - 1) {
        // Last player has revealed
        state.revealPhaseActive = false;
        state.currentBidder = null;
      } else {
        // Move to next player
        state.currentBidder = playerIds[currentIndex + 1];
      }
    },
    
    /**
     * Complete the entire bidding phase (both bidding and revealing)
     */
    completeBiddingPhase: (state) => {
      state.bidPhaseComplete = true;
      state.revealPhaseActive = false;
      state.currentBidder = null;
      
      // Mark all bids as revealed
      Object.keys(state.bids).forEach(playerId => {
        state.bids[playerId].revealed = true;
      });
    },
    
    /**
     * Reset bidding for a new round
     */
    resetBidding: (state) => {
      return initialBiddingState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(initializeGame.fulfilled, (state, action) => {
      const playerIds = action.payload.players.map(p => p.id);
      
      // Reset state with normalized approach
      state.bids = {};
      state.currentBidder = playerIds[0];
      state.bidPhaseComplete = false;
      state.revealPhaseActive = false;
      
      // Store player order as a normalized relationship
      state.playerOrder = {
        entities: {},
        ids: [...playerIds],
      };
      
      playerIds.forEach((id, index) => {
        state.playerOrder.entities[id] = {
          id,
          bidPosition: index,
          revealPosition: index,
        };
      });
    });
  },
});

export const {
  startBidding,
  placeBid,
  startBidReveal,
  revealBid,
  completeBiddingPhase,
  resetBidding,
} = biddingSlice.actions;

export default biddingSlice.reducer;

/**
 * Thunk to handle placing a bid and updating player state
 */
export const placeBidAndUpdatePlayer = (payload: PlaceBidPayload) => (dispatch: any) => {
  // Update player's bid cards
  dispatch(setBidCards({
    playerId: payload.playerId,
    cardIds: payload.bidCards.map(card => card.id),
  }));
  
  // Record the bid in the bidding state
  dispatch(placeBid(payload));
};

/**
 * Thunk to handle revealing a bid and updating player state
 */
export const revealBidAndUpdatePlayer = (payload: RevealBidPayload) => (dispatch: any) => {
  // Update player's bid reveal state
  dispatch(toggleRevealBid(payload.playerId));
  
  // Record the reveal in the bidding state
  dispatch(revealBid(payload));
}; 