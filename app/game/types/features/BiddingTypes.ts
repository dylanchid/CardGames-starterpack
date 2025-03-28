/**
 * @fileoverview Bidding types for the Ninety-Nine card game
 */

import { CardType } from '../card';
import { NormalizedCollection } from '../core/GameTypes';

/**
 * Represents a bid made by a player
 */
export interface Bid {
  playerId: string;
  cardIds: string[];
  revealed: boolean;
  timestamp: number;
}

/**
 * Player order information
 */
export interface PlayerOrderInfo {
  id: string;
  bidPosition: number;
  revealPosition: number;
}

/**
 * State related to bidding
 */
export interface BiddingState {
  bids: { [key: string]: Bid };
  playerOrder: NormalizedCollection<PlayerOrderInfo>;
  currentBidder: string | null;
  bidPhaseComplete: boolean;
  revealPhaseActive: boolean;
}

/**
 * Initial bidding state
 */
export const initialBiddingState: BiddingState = {
  bids: {},
  playerOrder: {
    entities: {},
    ids: []
  },
  currentBidder: null,
  bidPhaseComplete: false,
  revealPhaseActive: false,
};

/**
 * Bid placement payload
 */
export interface PlaceBidPayload {
  playerId: string;
  bidCards: CardType[];
}

/**
 * Bid reveal payload
 */
export interface RevealBidPayload {
  playerId: string;
} 