/**
 * @fileoverview Selectors for the game slice
 */

import { RootState } from '../../store';

/**
 * Select the entire game state
 */
export const selectGameState = (state: RootState) => state.game;

/**
 * Select current game phase
 */
export const selectGamePhase = (state: RootState) => state.game.gamePhase;

/**
 * Select current player index 
 */
export const selectCurrentPlayerIndex = (state: RootState) => state.game.currentPlayerIndex;

/**
 * Select game loading state
 */
export const selectGameLoading = (state: RootState) => state.game.isLoading;

/**
 * Select game error state
 */
export const selectGameError = (state: RootState) => state.game.error;

/**
 * Select turnup card ID
 */
export const selectTurnupCardId = (state: RootState) => state.game.turnupCardId;

/**
 * Select game round number
 */
export const selectRoundNumber = (state: RootState) => state.game.roundNumber;

/**
 * Select tricks played
 */
export const selectTricksPlayed = (state: RootState) => state.game.tricksPlayed;

/**
 * Select game history
 */
export const selectTrickHistory = (state: RootState) => state.game.trickHistory;

/**
 * Select if game has started
 */
export const selectGameStarted = (state: RootState) => state.game.gameStarted;

/**
 * Select game mode
 */
export const selectGameMode = (state: RootState) => state.game.gameMode;

/**
 * Select game settings
 */
export const selectGameSettings = (state: RootState) => state.game.gameSettings;

/**
 * Select current trick leader
 */
export const selectCurrentTrickLeader = (state: RootState) => state.game.currentTrickLeader;

/**
 * Select last action
 */
export const selectLastAction = (state: RootState) => state.game.lastAction; 