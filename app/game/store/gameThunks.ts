/**
 * @fileoverview Redux thunks for coordinated game actions
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import type { RootState, AppDispatch, AppThunk } from './store';
import { 
  setGameLoading, 
  setGameError, 
  setGamePhase, 
  setGameStarted, 
  setGameTurnupCard,
  addPlayer, 
  setPlayers, 
  resetPlayersForNewRound,
  placeBid, 
  revealBid, 
  startBidding, 
  resetBidding,
  playCard, 
  dealCards as dealCardsAction, 
  initializeDeck, 
  resetCardPlay, 
  setPlayOrder
} from './slices';
import { createDeck, dealCards } from '../utils/gameUtils';
import { CardType } from '../types/card';
import { Player } from '../types/core/PlayerTypes';
import { PlaceBidPayload } from '../types/features/BiddingTypes';
import { PlayCardPayload } from '../types/features/CardPlayTypes';

/**
 * Initialize the game
 */
export const initializeGame = createAsyncThunk(
  'game/initializeGame',
  async (numPlayers: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setGameLoading(true));
      
      // Create players
      const players = Array(numPlayers).fill(null).map((_, index) => ({
        id: `player-${index + 1}`,
        name: `Player ${index + 1}`,
        handIds: [],
        bidCardIds: [],
        revealBid: false,
        tricksWon: 0,
        score: 0,
        isActive: true,
      }));

      // Create and shuffle deck
      const deck = createDeck();
      
      // Deal cards
      const { hands, remainingDeck, turnupCard } = dealCards(deck, numPlayers, 12);

      return {
        players,
        deck: remainingDeck,
        turnupCard,
        hands,
      };
    } catch (error) {
      return rejectWithValue({
        type: 'NETWORK',
        message: 'Failed to initialize game',
        details: error,
      });
    } finally {
      dispatch(setGameLoading(false));
    }
  }
);

/**
 * Start a new game
 */
export const startGame = (numPlayers: number): AppThunk => async (dispatch, getState) => {
  try {
    dispatch(setGameLoading(true));
    
    // Initialize the game
    const result = await dispatch(initializeGame(numPlayers)).unwrap();
    
    // Set the initial game state
    dispatch(setGamePhase('bidding'));
    dispatch(setGameStarted(true));
    
    // Set up bidding phase
    dispatch(startBidding(result.players.map(p => p.id)));
  } catch (error: any) {
    dispatch(setGameError({
      type: 'NETWORK',
      message: 'Failed to start game',
      details: error,
    }));
  } finally {
    dispatch(setGameLoading(false));
  }
};

/**
 * Place a bid
 */
export const placeBidAction = (payload: PlaceBidPayload): AppThunk => async (dispatch, getState) => {
  try {
    // Place the bid
    dispatch(placeBid(payload));
    
    // Check if all players have bid
    const state = getState();
    const allPlayersHaveBid = state.bidding.bidPhaseComplete;
    
    if (allPlayersHaveBid) {
      // Move to playing phase
      dispatch(setGamePhase('playing'));
    }
  } catch (error: any) {
    dispatch(setGameError({
      type: 'VALIDATION',
      message: 'Failed to place bid',
      details: error,
    }));
  }
};

/**
 * Reveal a bid
 */
export const revealBidAction = (playerId: string): AppThunk => async (dispatch, getState) => {
  try {
    // Reveal the bid
    dispatch(revealBid({ playerId }));
  } catch (error: any) {
    dispatch(setGameError({
      type: 'VALIDATION',
      message: 'Failed to reveal bid',
      details: error,
    }));
  }
};

/**
 * Play a card
 */
export const playCardAction = (payload: PlayCardPayload): AppThunk => async (dispatch, getState) => {
  try {
    // Play the card
    dispatch(playCard(payload));
    
    // Check if trick is complete
    const state = getState();
    const isTrickComplete = state.cardPlay.currentTrick.complete;
    
    if (isTrickComplete) {
      // Process trick completion
      // This would typically update scores, determine winner, etc.
      // For now, we'll just log it
      console.log('Trick complete!');
    }
  } catch (error: any) {
    dispatch(setGameError({
      type: 'VALIDATION',
      message: 'Failed to play card',
      details: error,
    }));
  }
};

/**
 * Deal cards for a new round
 */
export const dealCardsForRound = (): AppThunk => async (dispatch, getState) => {
  try {
    const state = getState();
    const numPlayers = state.player.ids.length;
    const cardsPerPlayer = state.game.gameSettings.cardsPerPlayer;
    
    // Deal cards
    dispatch(dealCardsAction({ numPlayers, cardsPerPlayer }));
    
    // Move to bidding phase
    dispatch(setGamePhase('bidding'));
    
    // Set up bidding order
    dispatch(startBidding(state.player.ids));
  } catch (error: any) {
    dispatch(setGameError({
      type: 'GAME_STATE',
      message: 'Failed to deal cards',
      details: error,
    }));
  }
};

/**
 * Start a new round
 */
export const startNewRound = (): AppThunk => async (dispatch, getState) => {
  try {
    // Reset player hands, bids, etc.
    dispatch(resetPlayersForNewRound());
    
    // Reset bidding state
    dispatch(resetBidding());
    
    // Reset card play state but keep the cards
    dispatch(resetCardPlay());
    
    // Deal new cards
    dispatch(dealCardsForRound());
  } catch (error: any) {
    dispatch(setGameError({
      type: 'GAME_STATE',
      message: 'Failed to start new round',
      details: error,
    }));
  }
};

/**
 * Save game state (This would typically interact with a backend)
 */
export const saveGameState = createAsyncThunk(
  'game/saveGameState',
  async (_, { getState, rejectWithValue }) => {
    try {
      // For now, just return the current state
      // In a real implementation, this would save to a server
      return { success: true };
    } catch (error) {
      return rejectWithValue({
        type: 'NETWORK',
        message: 'Failed to save game state',
        details: error,
      });
    }
  }
);

export const loadGameState = createAsyncThunk(
  'game/loadGameState',
  async (_, { rejectWithValue }) => {
    try {
      const savedState = localStorage.getItem('gameState');
      if (!savedState) {
        throw new Error('No saved game state found');
      }
      return JSON.parse(savedState);
    } catch (error) {
      return rejectWithValue({
        type: 'NETWORK',
        message: 'Failed to load game state',
        details: error,
      });
    }
  }
); 