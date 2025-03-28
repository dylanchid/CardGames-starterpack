/**
 * @fileoverview Core game types for the Ninety-Nine card game
 */

import { CardType, Suit } from '../card';

/**
 * Represents the different phases of the game
 */
export type GamePhase = 'dealing' | 'bidding' | 'playing' | 'scoring';

/**
 * Represents the different game modes/variants
 */
export type GameMode = 'standard' | 'trump' | 'no-trump' | 'partnership';

/**
 * Represents game settings and configuration
 */
export interface GameSettings {
  maxRounds: number;
  maxTricks: number;
  cardsPerPlayer: number;
  allowTrump: boolean;
  allowNoTrump: boolean;
  allowPartnership: boolean;
  scoringSystem: 'standard' | 'advanced';
  timeLimit?: number; // in seconds
  autoPlay?: boolean;
}

/**
 * Represents a game error
 */
export interface GameError {
  type: 'VALIDATION' | 'GAME_STATE' | 'NETWORK' | 'UNKNOWN';
  message: string;
  details?: unknown;
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
  leadSuit: Suit;
  timestamp: number;
}

/**
 * Normalized structure for collections
 */
export interface NormalizedCollection<T> {
  entities: { [key: string]: T };
  ids: string[];
}

/**
 * Core game state (excluding player and card-specific state)
 */
export interface CoreGameState {
  gamePhase: GamePhase;
  gameMode: GameMode;
  roundNumber: number;
  tricksPlayed: number;
  currentTrickLeader: number;
  currentPlayerIndex: number;
  gameStarted: boolean;
  turnupCardId: string | null;
  isLoading: boolean;
  error: GameError | null;
  lastAction: string | null;
  gameSettings: GameSettings;
  trickHistory: NormalizedCollection<TrickHistory>;
}

/**
 * Initial core game state
 */
export const initialCoreGameState: CoreGameState = {
  gamePhase: 'dealing',
  gameMode: 'standard',
  roundNumber: 1,
  tricksPlayed: 0,
  currentTrickLeader: 0,
  currentPlayerIndex: 0,
  gameStarted: false,
  turnupCardId: null,
  isLoading: false,
  error: null,
  lastAction: null,
  gameSettings: {
    maxRounds: 3,
    maxTricks: 9,
    cardsPerPlayer: 12,
    allowTrump: true,
    allowNoTrump: true,
    allowPartnership: false,
    scoringSystem: 'standard',
    timeLimit: 30,
    autoPlay: false,
  },
  trickHistory: {
    entities: {},
    ids: []
  },
}; 