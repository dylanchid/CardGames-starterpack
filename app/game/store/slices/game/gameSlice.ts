/**
 * @fileoverview Core game slice for managing overall game state
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  CoreGameState, 
  initialCoreGameState, 
  GamePhase, 
  GameMode, 
  GameSettings, 
  GameError,
  TrickHistory 
} from '../../../types/core/GameTypes';
import { initializeGame } from '../../gameThunks';

const gameSlice = createSlice({
  name: 'game',
  initialState: initialCoreGameState,
  reducers: {
    /**
     * Set the game phase
     */
    setGamePhase: (state, action: PayloadAction<GamePhase>) => {
      state.gamePhase = action.payload;
      state.lastAction = 'setGamePhase';
    },
    
    /**
     * Set the game mode
     */
    setGameMode: (state, action: PayloadAction<GameMode>) => {
      state.gameMode = action.payload;
      state.lastAction = 'setGameMode';
    },
    
    /**
     * Update game settings
     */
    updateGameSettings: (state, action: PayloadAction<Partial<GameSettings>>) => {
      state.gameSettings = {
        ...state.gameSettings,
        ...action.payload,
      };
      state.lastAction = 'updateGameSettings';
    },
    
    /**
     * Set turnup card
     */
    setTurnupCard: (state, action: PayloadAction<string | null>) => {
      state.turnupCardId = action.payload;
      state.lastAction = 'setTurnupCard';
    },
    
    /**
     * Set current player index
     */
    setCurrentPlayerIndex: (state, action: PayloadAction<number>) => {
      state.currentPlayerIndex = action.payload;
      state.lastAction = 'setCurrentPlayerIndex';
    },
    
    /**
     * Set current trick leader
     */
    setCurrentTrickLeader: (state, action: PayloadAction<number>) => {
      state.currentTrickLeader = action.payload;
      state.lastAction = 'setCurrentTrickLeader';
    },
    
    /**
     * Set round number
     */
    setRoundNumber: (state, action: PayloadAction<number>) => {
      state.roundNumber = action.payload;
      state.lastAction = 'setRoundNumber';
    },
    
    /**
     * Set tricks played
     */
    setTricksPlayed: (state, action: PayloadAction<number>) => {
      state.tricksPlayed = action.payload;
      state.lastAction = 'setTricksPlayed';
    },
    
    /**
     * Set game started
     */
    setGameStarted: (state, action: PayloadAction<boolean>) => {
      state.gameStarted = action.payload;
      state.lastAction = 'setGameStarted';
    },
    
    /**
     * Set error
     */
    setError: (state, action: PayloadAction<GameError | null>) => {
      state.error = action.payload;
      state.lastAction = 'setError';
    },
    
    /**
     * Set loading
     */
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      state.lastAction = 'setLoading';
    },
    
    /**
     * Set last action
     */
    setLastAction: (state, action: PayloadAction<string | null>) => {
      state.lastAction = action.payload;
    },
    
    /**
     * Add trick to history using normalized pattern
     */
    addTrickToHistory: (state, action: PayloadAction<Omit<TrickHistory, 'id' | 'timestamp'>>) => {
      const id = crypto.randomUUID();
      const timestamp = Date.now();
      
      const newTrick: TrickHistory = {
        ...action.payload,
        id,
        timestamp,
      };
      
      // Add to normalized structure
      state.trickHistory.entities[id] = newTrick;
      state.trickHistory.ids.push(id);
      
      state.lastAction = 'addTrickToHistory';
    },
    
    /**
     * Clear trick history
     */
    clearTrickHistory: (state) => {
      state.trickHistory.entities = {};
      state.trickHistory.ids = [];
      state.lastAction = 'clearTrickHistory';
    },
    
    /**
     * Start new round
     */
    startNewRound: (state) => {
      state.roundNumber += 1;
      state.tricksPlayed = 0;
      state.gamePhase = 'dealing';
      state.currentPlayerIndex = 0;
      state.currentTrickLeader = 0;
      state.error = null;
      state.lastAction = 'startNewRound';
    },
    
    /**
     * Finish game
     */
    finishGame: (state) => {
      state.gamePhase = 'scoring';
      state.lastAction = 'finishGame';
    },
    
    /**
     * Reset game
     */
    resetGame: (state) => {
      return initialCoreGameState;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeGame.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeGame.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.gameStarted = true;
        state.gamePhase = 'bidding';
        state.currentPlayerIndex = 0;
        state.currentTrickLeader = 0;
        state.roundNumber = 1;
        state.tricksPlayed = 0;
        state.trickHistory.entities = {};
        state.trickHistory.ids = [];
        state.turnupCardId = action.payload.turnupCard?.id || null;
        state.lastAction = 'initializeGame';
      })
      .addCase(initializeGame.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error as GameError;
      });
  },
});

export const {
  setGamePhase,
  setGameMode,
  updateGameSettings,
  setTurnupCard,
  setCurrentPlayerIndex,
  setCurrentTrickLeader,
  setRoundNumber,
  setTricksPlayed,
  setGameStarted,
  setError,
  setLoading,
  setLastAction,
  addTrickToHistory,
  clearTrickHistory,
  startNewRound,
  finishGame,
  resetGame,
} = gameSlice.actions;

export default gameSlice.reducer; 