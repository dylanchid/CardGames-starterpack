/**
 * @fileoverview Core game type definitions
 */

import { CardType } from '../../game/types/card';
import { StackType } from './StackTypes';

export type GamePhase = 
  | 'setup'
  | 'dealing'
  | 'bidding'
  | 'playing'
  | 'scoring'
  | 'finished'
  | 'complete';

export type GameMode = 'standard' | 'trump' | 'no-trump' | 'partnership';

export interface GameSettings {
  maxPlayers: number;
  minPlayers: number;
  maxRounds: number;
  maxTricks: number;
  cardsPerPlayer: number;
  roundTimeLimit: number;
  trickTimeLimit: number;
  timeLimit: number;
  allowUndo: boolean;
  allowRedo: boolean;
  autoPlay: boolean;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  allowTrump: boolean;
  allowNoTrump: boolean;
  allowPartnership: boolean;
  scoringSystem: string;
  mode: GameMode;
}

export interface Player {
  id: string;
  name: string;
  isAI: boolean;
  score: number;
  hand: string[];
  tricks: string[];
  bids: string[];
  isReady: boolean;
  lastAction?: string;
  lastActionTimestamp?: number;
}

export interface Trick {
  id: string;
  leaderId: string;
  cards: {
    playerId: string;
    cardId: string;
    timestamp: number;
  }[];
  winnerId: string;
  timestamp: number;
  roundNumber: number;
}

export interface Bid {
  id: string;
  playerId: string;
  cardIds: string[];
  value: number;
  timestamp: number;
  roundNumber: number;
  isRevealed: boolean;
}

export interface GameState {
  core: {
    phase: GamePhase;
    roundNumber: number;
    turnupCardId: string | null;
    settings: GameSettings;
    error: string | null;
    lastAction: string | null;
    lastActionTimestamp: number | null;
  };
  entities: {
    players: Record<string, Player>;
    tricks: Record<string, Trick>;
    bids: Record<string, Bid>;
    cards: Record<string, CardType>;
    stacks: Record<string, StackType>;
  };
  relationships: {
    playerOrder: string[];
    currentTrick: string | null;
    currentPlayer: string | null;
    currentBidder: string | null;
  };
  ui: {
    selectedCards: string[];
    draggedCard: string | null;
    animationState: {
      isAnimating: boolean;
      currentAnimation: string | null;
      animationQueue: string[];
    };
  };
}

export interface GameAction {
  type: string;
  payload: any;
  timestamp: number;
  playerId: string;
}

export interface GameError {
  code: string;
  message: string;
  details?: any;
}

export interface GameSync {
  state: GameState;
  version: number;
  timestamp: number;
  lastAction: GameAction | null;
}

export interface GameContextValue {
  state: GameState;
  actions: {
    // Core actions
    setPhase: (phase: GamePhase) => void;
    updateSettings: (settings: Partial<GameSettings>) => void;
    setError: (error: string | null) => void;
    
    // Player actions
    addPlayer: (player: Player) => void;
    updatePlayer: (player: Player) => void;
    removePlayer: (playerId: string) => void;
    
    // Trick actions
    addTrick: (trick: Trick) => void;
    updateTrick: (trick: Trick) => void;
    
    // Bid actions
    addBid: (bid: Bid) => void;
    updateBid: (bid: Bid) => void;
    revealBids: () => void;
    
    // Relationship actions
    setCurrentTrick: (trickId: string | null) => void;
    setCurrentPlayer: (playerId: string | null) => void;
    setCurrentBidder: (playerId: string | null) => void;
    
    // UI actions
    setSelectedCards: (cardIds: string[]) => void;
    setDraggedCard: (cardId: string | null) => void;
    setAnimationState: (state: {
      isAnimating: boolean;
      currentAnimation: string | null;
      animationQueue: string[];
    }) => void;
    
    // Game actions
    playCard: (cardId: string) => void;
    cancelAction: () => void;
    
    // Reset
    resetGame: () => void;
  };
  queries: {
    // Core queries
    getPhase: () => GamePhase;
    getSettings: () => GameSettings;
    getError: () => string | null;
    getLastAction: () => string | null;
    getLastActionTimestamp: () => number | null;
    
    // Entity queries
    getPlayer: (playerId: string) => Player | undefined;
    getTrick: (trickId: string) => Trick | undefined;
    getBid: (bidId: string) => Bid | undefined;
    
    // Relationship queries
    getCurrentTrick: () => Trick | undefined;
    getCurrentPlayer: () => Player | undefined;
    getCurrentBidder: () => Player | undefined;
    getPlayerOrder: () => Player[];
    
    // UI queries
    getSelectedCards: () => string[];
    getDraggedCard: () => string | null;
    getAnimationState: () => {
      isAnimating: boolean;
      currentAnimation: string | null;
      animationQueue: string[];
    };
    
    // Derived queries
    isPlayerTurn: (playerId: string) => boolean;
    isPlayerBidding: (playerId: string) => boolean;
    isCardSelected: (cardId: string) => boolean;
    isCardDragged: (cardId: string) => boolean;
    isAnimating: () => boolean;
  };
}

export interface TrickHistory {
  id: string;
  roundNumber: number;
  trickNumber: number;
  cardIds: string[];
  winnerId: string;
  leadSuit: string;
  timestamp: number;
} 