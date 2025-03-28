/**
 * @fileoverview Card play types for the Ninety-Nine card game
 */

import { CardType, Suit } from '../card';

/**
 * Represents the state of the current trick with normalized structure
 */
export interface CurrentTrick {
  id: string;
  playerCardMap: Record<string, string | null>; // Maps player IDs to card IDs
  leadSuit: Suit | null;
  leadPlayerId: string;
  winnerId: string | null;
  complete: boolean;
}

/**
 * Represents the card play state
 */
export interface CardPlayState {
  currentTrick: CurrentTrick;
  deckIds: string[];
  cardsInPlay: { [key: string]: CardType };
  trickNumber: number;
  playOrder: string[];
  currentPlayerIndex: number;
}

/**
 * Initial card play state
 */
export const initialCardPlayState: CardPlayState = {
  currentTrick: {
    id: '',
    playerCardMap: {},
    leadSuit: null,
    leadPlayerId: '',
    winnerId: null,
    complete: false,
  },
  deckIds: [],
  cardsInPlay: {},
  trickNumber: 0,
  playOrder: [],
  currentPlayerIndex: 0,
};

/**
 * Card play payload
 */
export interface PlayCardPayload {
  playerId: string;
  card: CardType;
}

/**
 * Deal cards result
 */
export interface DealCardsResult {
  hands: CardType[][];
  remainingDeck: CardType[];
  turnupCard: CardType | null;
}

/**
 * Complete trick payload
 */
export interface CompleteTrickPayload {
  winnerIndex: number;
  winnerId: string;
  trickNumber: number;
  cardIds?: string[];
  leadSuit?: Suit;
} 