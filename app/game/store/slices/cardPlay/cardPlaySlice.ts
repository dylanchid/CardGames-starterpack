/**
 * @fileoverview Redux slice for managing card play state
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CardType, Suit } from '../../../types/card';
import { 
  CardPlayState, 
  initialCardPlayState, 
  PlayCardPayload, 
  CompleteTrickPayload,
  CurrentTrick
} from '../../../types/features/CardPlayTypes';
import { initializeGame } from '../../gameThunks';
import { createDeck, dealCards as dealCardsUtil, isValidPlay, determineTrickWinner } from '../../../utils/gameUtils';
import { removeCardFromHand, updateTricksWon } from '../player/playerSlice';
import { TrickHistory } from '../../../types/core/GameTypes';

const cardPlaySlice = createSlice({
  name: 'cardPlay',
  initialState: initialCardPlayState,
  reducers: {
    /**
     * Initialize deck
     */
    initializeDeck: (state) => {
      const deck = createDeck();
      state.deckIds = deck.map(card => card.id);
      state.cardsInPlay = deck.reduce((acc, card) => ({
        ...acc,
        [card.id]: card,
      }), {});
    },
    
    /**
     * Set up play order
     */
    setPlayOrder: (state, action: PayloadAction<string[]>) => {
      state.playOrder = action.payload;
      state.currentPlayerIndex = 0;
    },
    
    /**
     * Initialize a new trick
     */
    initializeNewTrick: (state, action: PayloadAction<number>) => {
      const leadPlayerIndex = action.payload;
      
      // Create a properly normalized trick structure
      const trickId = crypto.randomUUID();
      const playerCardMap: Record<string, string | null> = {};
      
      // Initialize player card map with nulls for all players
      state.playOrder.forEach(playerId => {
        playerCardMap[playerId] = null;
      });
      
      state.currentTrick = {
        id: trickId,
        playerCardMap,
        leadSuit: null,
        leadPlayerId: state.playOrder[leadPlayerIndex],
        winnerId: null,
        complete: false,
      };
      
      state.currentPlayerIndex = leadPlayerIndex;
      state.trickNumber += 1;
    },
    
    /**
     * Play a card
     */
    playCard: (state, action: PayloadAction<PlayCardPayload>) => {
      const { playerId, card } = action.payload;
      const playerIndex = state.playOrder.indexOf(playerId);
      
      if (playerIndex === -1 || playerIndex !== state.currentPlayerIndex) {
        return;
      }
      
      // Add card to the current trick using normalized approach
      state.currentTrick.playerCardMap[playerId] = card.id;
      
      // Set lead suit if first card in trick
      if (state.currentTrick.leadSuit === null) {
        state.currentTrick.leadSuit = card.suit;
      }
      
      // Move to next player or complete trick
      const allPlayersPlayed = Object.values(state.currentTrick.playerCardMap).every(cardId => cardId !== null);
      
      if (allPlayersPlayed) {
        // Trick is complete
        const trickCards = Object.entries(state.currentTrick.playerCardMap).map(([playerId, cardId]) => ({
          playerId,
          card: state.cardsInPlay[cardId as string]
        }));
        
        const winnerIndex = determineTrickWinner(
          trickCards.map(tc => tc.card),
          state.currentTrick.leadSuit as Suit,
          null // No trump suit
        );
        
        const winnerId = state.playOrder[winnerIndex];
        state.currentTrick.winnerId = winnerId;
        state.currentTrick.complete = true;
      } else {
        // Move to next player
        state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.playOrder.length;
      }
    },
    
    /**
     * Complete a trick
     */
    completeTrick: (state, action: PayloadAction<CompleteTrickPayload>) => {
      const { winnerIndex, trickNumber, winnerId } = action.payload;
      
      // Reset for the next trick with normalized structure
      const trickId = crypto.randomUUID();
      const playerCardMap: Record<string, string | null> = {};
      
      // Initialize player card map with nulls for all players
      state.playOrder.forEach(playerId => {
        playerCardMap[playerId] = null;
      });
      
      state.currentTrick = {
        id: trickId,
        playerCardMap,
        leadSuit: null,
        leadPlayerId: state.playOrder[winnerIndex],
        winnerId: null,
        complete: false,
      };
      
      state.currentPlayerIndex = winnerIndex;
    },
    
    /**
     * Deal cards for a new round
     */
    dealCards: (state, action: PayloadAction<{ numPlayers: number; cardsPerPlayer: number }>) => {
      const { numPlayers, cardsPerPlayer } = action.payload;
      
      // Create and shuffle a new deck
      const deck = createDeck();
      const result = dealCardsUtil(deck, numPlayers, cardsPerPlayer);
      
      // Update state
      state.deckIds = result.remainingDeck.map(card => card.id);
      
      // Add all cards to cardsInPlay
      const allCards = [...result.remainingDeck];
      if (result.turnupCard) {
        allCards.push(result.turnupCard);
      }
      
      result.hands.forEach(hand => {
        allCards.push(...hand);
      });
      
      state.cardsInPlay = allCards.reduce((acc, card) => ({
        ...acc,
        [card.id]: card,
      }), {});
      
      // Reset trick state with normalized structure
      const trickId = crypto.randomUUID();
      const playerCardMap: Record<string, string | null> = {};
      
      // We need to initialize with player IDs
      const samplePlayerIds = Array(numPlayers).fill(null).map((_, i) => `player-${i + 1}`);
      samplePlayerIds.forEach(playerId => {
        playerCardMap[playerId] = null;
      });
      
      state.currentTrick = {
        id: trickId,
        playerCardMap,
        leadSuit: null,
        leadPlayerId: samplePlayerIds[0],
        winnerId: null,
        complete: false,
      };
      
      state.trickNumber = 0;
      state.currentPlayerIndex = 0;
    },
    
    /**
     * Add a card to the cards in play
     */
    addCardToPlay: (state, action: PayloadAction<CardType>) => {
      const card = action.payload;
      state.cardsInPlay[card.id] = card;
    },
    
    /**
     * Reset card play state for a new round
     */
    resetCardPlay: (state) => {
      return {
        ...initialCardPlayState,
        cardsInPlay: state.cardsInPlay, // Keep the cards
      };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(initializeGame.fulfilled, (state, action) => {
      const players = action.payload.players;
      const allCards = [...action.payload.deck];
      
      if (action.payload.turnupCard) {
        allCards.push(action.payload.turnupCard);
      }
      
      action.payload.hands.forEach(hand => {
        allCards.push(...hand);
      });
      
      state.cardsInPlay = allCards.reduce((acc, card) => ({
        ...acc,
        [card.id]: card,
      }), {});
      
      state.deckIds = action.payload.deck.map(card => card.id);
      state.playOrder = players.map(p => p.id);
      state.currentPlayerIndex = 0;
      state.trickNumber = 0;
      
      // Initialize the normalized trick structure
      const trickId = crypto.randomUUID();
      const playerCardMap: Record<string, string | null> = {};
      
      // Initialize player card map with nulls for all players
      players.forEach(p => {
        playerCardMap[p.id] = null;
      });
      
      state.currentTrick = {
        id: trickId,
        playerCardMap,
        leadSuit: null,
        leadPlayerId: players[0].id,
        winnerId: null,
        complete: false,
      };
    });
  },
});

export const {
  initializeDeck,
  setPlayOrder,
  initializeNewTrick,
  playCard,
  completeTrick,
  dealCards,
  addCardToPlay,
  resetCardPlay,
} = cardPlaySlice.actions;

// Thunks for coordinated actions

/**
 * Play a card and update the player's hand
 */
export const playCardAndUpdatePlayer = (payload: PlayCardPayload) => (dispatch: any) => {
  // Remove the card from player's hand
  dispatch(removeCardFromHand({
    playerId: payload.playerId,
    cardId: payload.card.id,
  }));
  
  // Record the play in the card play state
  dispatch(playCard(payload));
};

/**
 * Complete a trick and update the winner's trick count
 */
export const completeTrickAndUpdateWinner = (payload: CompleteTrickPayload) => (dispatch: any) => {
  // Update the winner's trick count
  dispatch(updateTricksWon({
    playerId: payload.winnerId,
    tricksWon: 1, // Increment by 1
  }));
  
  // Record the trick completion
  dispatch(completeTrick(payload));
};

export default cardPlaySlice.reducer; 