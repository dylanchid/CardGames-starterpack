/**
 * @fileoverview Unified game state management
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameState, GamePhase, Player, Trick, Bid, GameSettings, TrickHistory, GameError } from '../../../types/core/GameTypes';
import { CardType, StackType } from '../../../types/card';

const initialState: GameState = {
  core: {
    phase: 'setup',
    roundNumber: 0,
    turnupCardId: null,
    settings: {
      maxPlayers: 4,
      minPlayers: 2,
      maxRounds: 1,
      maxTricks: 12,
      cardsPerPlayer: 12,
      roundTimeLimit: 30,
      trickTimeLimit: 10,
      timeLimit: 30,
      allowUndo: true,
      allowRedo: true,
      autoPlay: false,
      soundEnabled: true,
      animationsEnabled: true,
      allowTrump: false,
      allowNoTrump: true,
      allowPartnership: false,
      scoringSystem: 'standard',
      mode: 'standard',
    },
    error: null,
    lastAction: null,
    lastActionTimestamp: null,
  },
  entities: {
    players: {},
    tricks: {},
    bids: {},
    cards: {},
    stacks: {},
  },
  relationships: {
    playerOrder: [],
    currentTrick: null,
    currentPlayer: null,
    currentBidder: null,
  },
  ui: {
    selectedCards: [],
    draggedCard: null,
    isAnimating: false,
    currentAnimation: null,
    animationQueue: [],
  },
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    // Core game actions
    setPhase: (state, action: PayloadAction<GamePhase>) => {
      state.core.phase = action.payload;
      state.core.lastAction = 'phase_change';
      state.core.lastActionTimestamp = Date.now();
    },
    updateSettings: (state, action: PayloadAction<Partial<GameSettings>>) => {
      state.core.settings = { ...state.core.settings, ...action.payload };
      state.core.lastAction = 'settings_update';
      state.core.lastActionTimestamp = Date.now();
    },
    setError: (state, action: PayloadAction<GameError | null>) => {
      state.core.error = action.payload ? action.payload.message : null;
      state.core.lastAction = 'error_set';
      state.core.lastActionTimestamp = Date.now();
    },
    
    // Entity actions
    addPlayer: (state, action: PayloadAction<Player>) => {
      state.entities.players[action.payload.id] = action.payload;
      state.relationships.playerOrder.push(action.payload.id);
      state.core.lastAction = 'player_added';
      state.core.lastActionTimestamp = Date.now();
    },
    updatePlayer: (state, action: PayloadAction<Player>) => {
      state.entities.players[action.payload.id] = action.payload;
      state.core.lastAction = 'player_updated';
      state.core.lastActionTimestamp = Date.now();
    },
    removePlayer: (state, action: PayloadAction<string>) => {
      delete state.entities.players[action.payload];
      state.relationships.playerOrder = state.relationships.playerOrder.filter(id => id !== action.payload);
      state.core.lastAction = 'player_removed';
      state.core.lastActionTimestamp = Date.now();
    },
    
    addTrick: (state, action: PayloadAction<Trick>) => {
      state.entities.tricks[action.payload.id] = action.payload;
      state.core.lastAction = 'trick_added';
      state.core.lastActionTimestamp = Date.now();
    },
    updateTrick: (state, action: PayloadAction<Trick>) => {
      state.entities.tricks[action.payload.id] = action.payload;
      state.core.lastAction = 'trick_updated';
      state.core.lastActionTimestamp = Date.now();
    },
    
    addBid: (state, action: PayloadAction<Bid>) => {
      state.entities.bids[action.payload.id] = action.payload;
      state.core.lastAction = 'bid_added';
      state.core.lastActionTimestamp = Date.now();
    },
    updateBid: (state, action: PayloadAction<Bid>) => {
      state.entities.bids[action.payload.id] = action.payload;
      state.core.lastAction = 'bid_updated';
      state.core.lastActionTimestamp = Date.now();
    },
    
    // Relationship actions
    setCurrentTrick: (state, action: PayloadAction<string | null>) => {
      state.relationships.currentTrick = action.payload;
      state.core.lastAction = 'current_trick_set';
      state.core.lastActionTimestamp = Date.now();
    },
    setCurrentPlayer: (state, action: PayloadAction<string | null>) => {
      state.relationships.currentPlayer = action.payload;
      state.core.lastAction = 'current_player_set';
      state.core.lastActionTimestamp = Date.now();
    },
    setCurrentBidder: (state, action: PayloadAction<string | null>) => {
      state.relationships.currentBidder = action.payload;
      state.core.lastAction = 'current_bidder_set';
      state.core.lastActionTimestamp = Date.now();
    },
    
    // UI actions
    setSelectedCards: (state, action: PayloadAction<string[]>) => {
      state.ui.selectedCards = action.payload;
      state.core.lastAction = 'cards_selected';
      state.core.lastActionTimestamp = Date.now();
    },
    setDraggedCard: (state, action: PayloadAction<string | null>) => {
      state.ui.draggedCard = action.payload;
      state.core.lastAction = 'card_dragged';
      state.core.lastActionTimestamp = Date.now();
    },
    setAnimationState: (state, action: PayloadAction<{
      isAnimating: boolean;
      currentAnimation: string | null;
      animationQueue: string[];
    }>) => {
      state.ui.isAnimating = action.payload.isAnimating;
      state.core.lastAction = 'animation_state_set';
      state.core.lastActionTimestamp = Date.now();
    },
    
    // Reset game state
    resetGame: () => initialState,

    // Add trick to history
    addTrickToHistory: (state, action: PayloadAction<TrickHistory>) => {
      state.core.lastAction = 'trick_added_to_history';
      state.core.lastActionTimestamp = Date.now();
    },

    // Clear trick history
    clearTrickHistory: (state) => {
      state.core.lastAction = 'trick_history_cleared';
      state.core.lastActionTimestamp = Date.now();
    },

    // Finish game
    finishGame: (state) => {
      state.core.phase = 'scoring' as GamePhase;
      state.core.lastAction = 'game_finished';
      state.core.lastActionTimestamp = Date.now();
    },

    // Add new reducers
    setTurnupCard: (state, action: PayloadAction<string | null>) => {
      state.core.turnupCardId = action.payload;
      state.core.lastAction = 'turnup_card_set';
      state.core.lastActionTimestamp = Date.now();
    },

    startNewRound: (state) => {
      state.core.roundNumber += 1;
      state.core.lastAction = 'new_round_started';
      state.core.lastActionTimestamp = Date.now();
    },

    updateGameSettings: (state, action: PayloadAction<Partial<GameSettings>>) => {
      state.core.settings = { ...state.core.settings, ...action.payload };
      state.core.lastAction = 'game_settings_updated';
      state.core.lastActionTimestamp = Date.now();
    },
  },
});

export const {
  setPhase,
  updateSettings,
  setError,
  addPlayer,
  updatePlayer,
  removePlayer,
  addTrick,
  updateTrick,
  addBid,
  updateBid,
  setCurrentTrick,
  setCurrentPlayer,
  setCurrentBidder,
  setSelectedCards,
  setDraggedCard,
  setAnimationState,
  resetGame,
  addTrickToHistory,
  clearTrickHistory,
  finishGame,
  setTurnupCard,
  startNewRound,
  updateGameSettings
} = gameSlice.actions;

export default gameSlice.reducer; 