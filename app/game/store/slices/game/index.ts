/**
 * @fileoverview Game slice exports
 */

import gameReducer, {
  setGamePhase,
  setGameMode,
  updateGameSettings,
  setTurnupCard,
  setCurrentPlayerIndex,
  setCurrentTrickLeader,
  setRoundNumber, 
  setTricksPlayed,
  setGameStarted,
  setError,
  setLoading,
  setLastAction,
  addTrickToHistory,
  clearTrickHistory,
  startNewRound,
  finishGame,
  resetGame
} from './gameSlice';

import type { 
  GamePhase, 
  GameMode, 
  GameSettings, 
  GameError 
} from '../../../types/core/GameTypes';

import {
  selectGameState,
  selectGamePhase,
  selectCurrentPlayerIndex,
  selectGameLoading,
  selectGameError,
  selectTurnupCardId,
  selectRoundNumber,
  selectTricksPlayed,
  selectTrickHistory,
  selectGameStarted,
  selectGameMode,
  selectGameSettings,
  selectCurrentTrickLeader,
  selectLastAction
} from './gameSelectors';

// Export the reducer as default
export { gameReducer as default };

// Re-export all action creators
export {
  setGamePhase,
  setGameMode,
  updateGameSettings,
  setTurnupCard,
  setCurrentPlayerIndex,
  setCurrentTrickLeader,
  setRoundNumber, 
  setTricksPlayed,
  setGameStarted,
  setError,
  setLoading,
  setLastAction,
  addTrickToHistory,
  clearTrickHistory,
  startNewRound,
  finishGame,
  resetGame
};

// Re-export all selectors
export {
  selectGameState,
  selectGamePhase,
  selectCurrentPlayerIndex,
  selectGameLoading,
  selectGameError,
  selectTurnupCardId,
  selectRoundNumber,
  selectTricksPlayed,
  selectTrickHistory,
  selectGameStarted,
  selectGameMode,
  selectGameSettings,
  selectCurrentTrickLeader,
  selectLastAction
};

// Types
export type { GamePhase, GameMode, GameSettings, GameError }; 