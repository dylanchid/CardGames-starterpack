/**
 * @fileoverview Shared context types for the game
 */

import { CardType } from '../card';
import { Player, Trick, GamePhase, GameSettings, GameError } from '../../../types/core/GameTypes';
import { GameState } from './GameTypes';

/**
 * Game context value interface
 */
export interface GameContextValue {
  // State
  gamePhase: GamePhase;
  players: Player[];
  currentTrick: Trick | null;
  currentPlayer: Player | null;
  currentPlayerIndex: number;
  error: string | null;
  isLoading: boolean;
  lastAction: string | null;
  gameStarted: boolean;
  isCurrentPlayerActive: boolean;
  canPlayCard: boolean;
  roundNumber: number;
  isRoundComplete: boolean;
  isGameComplete: boolean;

  // Actions
  setPhase: (phase: GamePhase) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  setError: (error: string | null) => void;
  addPlayer: (player: Player) => void;
  updatePlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  addTrick: (trick: Trick) => void;
  updateTrick: (trick: Trick) => void;
  addBid: (bid: any) => void;
  updateBid: (bid: any) => void;
  setCurrentTrick: (trickId: string | null) => void;
  setCurrentPlayer: (playerId: string | null) => void;
  setCurrentBidder: (playerId: string | null) => void;
  setSelectedCards: (cardIds: string[]) => void;
  setDraggedCard: (cardId: string | null) => void;
  setAnimationState: (animationState: {
    isAnimating: boolean;
    currentAnimation: string | null;
    animationQueue: string[];
  }) => void;
  resetGame: () => void;
  revealBids: () => void;
  playCard: (cardId: string) => void;
  cancelAction: () => void;
  setGameStarted: (started: boolean) => void;
  setRoundNumber: (round: number) => void;
  startNewRound: () => void;
  setTurnupCard: (cardId: string | null) => void;

  // Queries
  getPhase: () => GamePhase;
  getSettings: () => GameSettings;
  getError: () => string | null;
  getLastAction: () => string | null;
  getLastActionTimestamp: () => number | null;
  getPlayer: (playerId: string) => Player | undefined;
  getTrick: (trickId: string) => Trick | undefined;
  getBid: (bidId: string) => any | undefined;
  getCurrentTrick: () => Trick | undefined;
}

/**
 * Card play context value interface
 */
export interface CardPlayContextValue {
  // Card play state
  currentTrick: {
    cards: (CardType | null)[];
    leadSuit: string | null;
    isComplete: boolean;
    winnerIndex: number | null;
  };
  trickNumber: number;
  currentPlayerIndex: number;
  currentPlayerId: string | null;
  
  // Card play actions
  playCard: (playerId: string, card: CardType) => Promise<void>;
  initializeNewTrick: (leadPlayerIndex: number) => void;
  completeTrick: (winnerIndex: number, winnerId: string, trickNumber: number) => void;
  resetCardPlay: () => void;
  
  // Card play queries
  getValidCardsToPlay: (playerId: string) => CardType[];
  getCurrentPlayerValidCards: () => CardType[];
} 