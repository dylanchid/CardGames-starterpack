/**
 * @fileoverview Core game types and interfaces
 */

import { CardType, StackType } from '../card';

/**
 * Represents the different phases of the game
 */
export type GamePhase = 'setup' | 'bidding' | 'playing' | 'scoring' | 'complete' | 'finished';

/**
 * Represents the different game modes/variants
 */
export type GameMode = 'standard' | 'trump' | 'no-trump' | 'partnership';

/**
 * Represents game settings and configuration
 */
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

/**
 * Represents a game error
 */
export interface GameError {
  type: 'NETWORK' | 'VALIDATION' | 'GAME_STATE';
  message: string;
  details: any;
}

/**
 * Represents a player in the game
 */
export interface Player {
  id: string;
  name: string;
  hand: string[];
  tricks: string[];
  bids: string[];
  score: number;
  isReady: boolean;
  isAI?: boolean;
  rating?: number;
  aiLevel?: 'easy' | 'medium' | 'hard';
  lastAction?: string;
  lastActionTimestamp?: number;
}

/**
 * Represents a completed trick
 */
export interface TrickHistory {
  id: string;
  roundNumber: number;
  trickNumber: number;
  cardIds: string[];
  winnerId: string;
  leadSuit: string;
  timestamp: number;
}

/**
 * Represents a trick in the game
 */
export interface Trick {
  id: string;
  cards: Array<{
    playerId: string;
    cardId: string;
    timestamp: number;
  }>;
  winnerId: string | null;
  leadSuit: string | null;
  leadPlayerId: string;
  complete: boolean;
}

/**
 * Represents a bid in the game
 */
export interface Bid {
  id: string;
  playerId: string;
  cardIds: string[];
  value: number;
  timestamp: number;
  roundNumber: number;
  isRevealed: boolean;
}

/**
 * Represents the game state
 */
export interface GameState {
  // Core game state
  core: {
    phase: GamePhase;
    roundNumber: number;
    turnupCardId: string | null;
    settings: GameSettings;
    error: string | null;
    lastAction: string | null;
    lastActionTimestamp: number | null;
  };
  
  // Normalized entities
  entities: {
    players: Record<string, Player>;
    cards: Record<string, CardType>;
    tricks: Record<string, Trick>;
    bids: Record<string, Bid>;
    stacks: Record<string, StackType>;
  };
  
  // Relationships
  relationships: {
    playerOrder: string[];
    currentTrick: string | null;
    currentPlayer: string | null;
    currentBidder: string | null;
  };
  
  // UI state
  ui: {
    selectedCards: string[];
    draggedCard: string | null;
    isAnimating: boolean;
    currentAnimation: string | null;
    animationQueue: string[];
  };
}

/**
 * Normalized structure for collections
 */
export interface NormalizedCollection<T> {
  entities: Record<string, T>;
  ids: string[];
}

/**
 * Initial game state
 */
export const initialGameState: GameState = {
  core: {
    phase: 'setup',
    roundNumber: 0,
    turnupCardId: null,
    settings: {
      maxPlayers: 4,
      minPlayers: 2,
      maxRounds: 1,
      maxTricks: 13,
      cardsPerPlayer: 13,
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
    cards: {},
    tricks: {},
    bids: {},
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