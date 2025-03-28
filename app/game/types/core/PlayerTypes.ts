/**
 * @fileoverview Player types for the Ninety-Nine card game
 */

/**
 * Represents a player in the game
 */
export interface Player {
  id: string;
  name: string;
  handIds: string[];
  bidCardIds: string[];
  revealBid: boolean;
  tricksWon: number;
  score: number;
  isActive: boolean;
}

/**
 * Player state with normalized storage
 */
export interface PlayerState {
  entities: { [key: string]: Player };
  ids: string[];
}

/**
 * Initial player state
 */
export const initialPlayerState: PlayerState = {
  entities: {},
  ids: [],
};

/**
 * Player update payload for batch updates
 */
export interface PlayerUpdates {
  [key: string]: Partial<Player>;
}

/**
 * Player creation payload
 */
export interface CreatePlayerPayload {
  name: string;
  id?: string;
}

/**
 * Player selection options
 */
export interface PlayerSelection {
  playerId: string;
} 