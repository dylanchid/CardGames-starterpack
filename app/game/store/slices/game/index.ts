/**
 * @fileoverview Game slice exports
 */

import gameReducer, {
  setPhase,
  updateSettings,
  setError,
  addPlayer,
  updatePlayer,
  removePlayer,
  addTrick,
  updateTrick,
  addBid,
  updateBid,
  setCurrentTrick,
  setCurrentPlayer,
  setCurrentBidder,
  setSelectedCards,
  setDraggedCard,
  setAnimationState,
  resetGame,
  addTrickToHistory,
  clearTrickHistory,
  finishGame,
  setTurnupCard,
  startNewRound,
  updateGameSettings
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
  selectGameSettings,
  selectGameError,
  selectLastAction,
  selectLastActionTimestamp,
  selectPlayerById,
  selectTrickById,
  selectBidById,
  selectCurrentTrickData,
  selectCurrentPlayerData,
  selectCurrentBidderData,
  selectPlayerOrderData,
  selectIsPlayerTurn,
  selectIsPlayerBidding,
  selectIsCardSelected,
  selectIsCardDragged,
  selectIsAnimating,
  selectSelectedCards,
  selectDraggedCard,
  selectAnimationState,
  selectCurrentPlayerIndex,
  selectCurrentTrickLeader,
  selectTrickHistory,
  selectRoundNumber,
  selectTricksPlayed
} from './gameSelectors';

// Export the reducer as default
export { gameReducer as default };

// Export actions
export {
  setPhase,
  updateSettings,
  setError,
  addPlayer,
  updatePlayer,
  removePlayer,
  addTrick,
  updateTrick,
  addBid,
  updateBid,
  setCurrentTrick,
  setCurrentPlayer,
  setCurrentBidder,
  setSelectedCards,
  setDraggedCard,
  setAnimationState,
  resetGame,
  addTrickToHistory,
  clearTrickHistory,
  finishGame,
  setTurnupCard,
  startNewRound,
  updateGameSettings
};

// Export selectors
export {
  selectGameState,
  selectGamePhase,
  selectGameSettings,
  selectGameError,
  selectLastAction,
  selectLastActionTimestamp,
  selectPlayerById,
  selectTrickById,
  selectBidById,
  selectCurrentTrickData,
  selectCurrentPlayerData,
  selectCurrentBidderData,
  selectPlayerOrderData,
  selectIsPlayerTurn,
  selectIsPlayerBidding,
  selectIsCardSelected,
  selectIsCardDragged,
  selectIsAnimating,
  selectSelectedCards,
  selectDraggedCard,
  selectAnimationState,
  selectCurrentPlayerIndex,
  selectCurrentTrickLeader,
  selectTrickHistory,
  selectRoundNumber,
  selectTricksPlayed
};

// Types
export type { GamePhase, GameMode, GameSettings, GameError }; 