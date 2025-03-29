/**
 * @fileoverview Selectors for accessing game state
 */

import { RootState } from '../../store';
import { GameState, Player, Trick, Bid, GamePhase } from '../../../types/core/GameTypes';
import { createSelector } from '@reduxjs/toolkit';
import { CardType } from '../../../types/card';

// Core state selectors
export const selectGameState = (state: RootState): GameState => state.game;

export const selectGamePhase = (state: RootState): GamePhase => 
  state.game.core.phase;

export const selectGameSettings = (state: RootState): GameState['core']['settings'] => 
  state.game.core.settings;

export const selectGameError = (state: RootState): GameState['core']['error'] => 
  state.game.core.error;

export const selectLastAction = (state: RootState): GameState['core']['lastAction'] => 
  state.game.core.lastAction;

export const selectLastActionTimestamp = (state: RootState): GameState['core']['lastActionTimestamp'] => 
  state.game.core.lastActionTimestamp;

// Entity selectors
export const selectPlayers = (state: RootState): GameState['entities']['players'] => 
  state.game.entities.players;

export const selectPlayerById = (state: RootState, playerId: string): Player | undefined => 
  state.game.entities.players[playerId];

export const selectTricks = (state: RootState): GameState['entities']['tricks'] => 
  state.game.entities.tricks;

export const selectTrickById = (state: RootState, trickId: string): Trick | undefined => 
  state.game.entities.tricks[trickId];

export const selectBids = (state: RootState): GameState['entities']['bids'] => 
  state.game.entities.bids;

export const selectBidById = (state: RootState, bidId: string): Bid | undefined => 
  state.game.entities.bids[bidId];

// Relationship selectors
export const selectPlayerOrder = (state: RootState): string[] => 
  state.game.relationships.playerOrder;

export const selectCurrentTrick = (state: RootState): GameState['relationships']['currentTrick'] => 
  state.game.relationships.currentTrick;

export const selectCurrentPlayer = (state: RootState): GameState['relationships']['currentPlayer'] => 
  state.game.relationships.currentPlayer;

export const selectCurrentBidder = (state: RootState): GameState['relationships']['currentBidder'] => 
  state.game.relationships.currentBidder;

// UI selectors
export const selectSelectedCards = (state: RootState): string[] => 
  state.game.ui.selectedCards;

export const selectDraggedCard = (state: RootState): string | null => 
  state.game.ui.draggedCard;

export const selectIsAnimating = (state: RootState): boolean => 
  state.game.ui.isAnimating;

export const selectAnimationState = (state: RootState) => ({
  isAnimating: state.game.ui.isAnimating,
  currentAnimation: state.game.ui.currentAnimation,
  animationQueue: state.game.ui.animationQueue,
});

// Derived selectors
export const selectCurrentTrickData = (state: RootState): Trick | undefined => {
  const currentTrickId = selectCurrentTrick(state);
  return currentTrickId ? selectTrickById(state, currentTrickId) : undefined;
};

export const selectCurrentPlayerData = (state: RootState): Player | undefined => {
  const currentPlayerId = selectCurrentPlayer(state);
  return currentPlayerId ? selectPlayerById(state, currentPlayerId) : undefined;
};

export const selectCurrentBidderData = (state: RootState): Player | undefined => {
  const currentBidderId = selectCurrentBidder(state);
  return currentBidderId ? selectPlayerById(state, currentBidderId) : undefined;
};

export const selectIsPlayerTurn = (state: RootState, playerId: string): boolean => 
  selectCurrentPlayer(state) === playerId;

export const selectIsPlayerBidding = (state: RootState, playerId: string): boolean => 
  selectCurrentBidder(state) === playerId;

export const selectIsCardSelected = (state: RootState, cardId: string): boolean => 
  selectSelectedCards(state).includes(cardId);

export const selectIsCardDragged = (state: RootState, cardId: string): boolean => 
  selectDraggedCard(state) === cardId;

// Memoized selectors
export const selectTrickHistory = createSelector(
  [(state: RootState) => state.game.entities.tricks],
  (tricks) => {
    return Object.values(tricks)
      .filter((trick): trick is Trick => trick.winnerId !== null)
      .sort((a: Trick, b: Trick) => {
        const aTimestamp = Math.max(...a.cards.map(c => c.timestamp));
        const bTimestamp = Math.max(...b.cards.map(c => c.timestamp));
        return bTimestamp - aTimestamp;
      });
  }
);

export const selectPlayerOrderData = createSelector(
  [(state: RootState) => state.game.relationships.playerOrder, 
   (state: RootState) => state.game.entities.players],
  (playerOrder, players) => 
    playerOrder.map(id => players[id]).filter((player): player is Player => player !== undefined)
);

// Additional memoized selectors
export const selectCurrentPlayerIndex = createSelector(
  [selectPlayerOrder, selectCurrentPlayer],
  (playerOrder, currentPlayerId) => 
    currentPlayerId ? playerOrder.indexOf(currentPlayerId) : -1
);

export const selectCurrentTrickLeader = createSelector(
  [selectCurrentTrickData],
  (currentTrick) => currentTrick?.leadPlayerId
);

// Additional core state selectors
export const selectGameLoading = (state: RootState): boolean => 
  state.game.core.phase === 'setup';

export const selectGameMode = (state: RootState): GameState['core']['settings']['mode'] => 
  state.game.core.settings.mode;

export const selectGameStarted = (state: RootState): boolean => 
  state.game.core.phase !== 'setup';

// Round and trick selectors
export const selectRoundNumber = (state: RootState): number => 
  state.game.core.roundNumber;

export const selectTricksPlayed = (state: RootState): number => 
  Object.keys(state.game.entities.tricks).length; 