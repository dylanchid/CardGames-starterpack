/**
 * @fileoverview Selectors for player state
 */

import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../store';

// Basic selectors
export const selectPlayerState = (state: RootState) => state.player;
export const selectPlayerIds = (state: RootState) => state.player.ids;
export const selectPlayerEntities = (state: RootState) => state.player.entities;
export const selectAllPlayers = createSelector(
  [selectPlayerEntities, selectPlayerIds],
  (entities, ids) => ids.map(id => entities[id])
);

// Parameterized selectors
export const selectPlayerById = (state: RootState, playerId: string) => 
  state.player.entities[playerId];

export const selectPlayerHand = createSelector(
  [(state: RootState, playerId: string) => selectPlayerById(state, playerId), 
   (state: RootState) => state.cardPlay.cardsInPlay],
  (player, cards) => player ? player.handIds.map(id => cards[id]) : []
);

export const selectPlayerBidCards = createSelector(
  [(state: RootState, playerId: string) => selectPlayerById(state, playerId), 
   (state: RootState) => state.cardPlay.cardsInPlay],
  (player, cards) => player ? player.bidCardIds.map(id => cards[id]) : []
);

export const selectPlayerTricksWon = (state: RootState, playerId: string) => 
  selectPlayerById(state, playerId)?.tricksWon || 0;

export const selectPlayerScore = (state: RootState, playerId: string) => 
  selectPlayerById(state, playerId)?.score || 0;

export const selectPlayerRevealBid = (state: RootState, playerId: string) => 
  selectPlayerById(state, playerId)?.revealBid || false;

export const selectPlayerIsActive = (state: RootState, playerId: string) => 
  selectPlayerById(state, playerId)?.isActive || false;

// Combined selectors
export const selectActivePlayerIds = createSelector(
  [selectAllPlayers],
  players => players.filter(player => player.isActive).map(player => player.id)
);

export const selectPlayerScores = createSelector(
  [selectAllPlayers],
  players => players.reduce((acc, player) => ({
    ...acc,
    [player.id]: player.score
  }), {})
);

export const selectPlayersByScore = createSelector(
  [selectAllPlayers],
  players => [...players].sort((a, b) => b.score - a.score)
);

export const selectCurrentPlayer = createSelector(
  [selectAllPlayers, (state: RootState) => state.game.currentPlayerIndex],
  (players, currentPlayerIndex) => players[currentPlayerIndex]
);

export const selectCurrentPlayerId = createSelector(
  [selectCurrentPlayer],
  player => player?.id
); 