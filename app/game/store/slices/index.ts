/**
 * @fileoverview Export all slices for easier imports
 */

// Export all reducers
export { default as gameReducer } from './game';
export { default as playerReducer } from './player/playerSlice';
export { default as biddingReducer } from './bidding/biddingSlice';
export { default as cardPlayReducer } from './cardPlay/cardPlaySlice';
export { default as cardReducer } from './cardSlice';
export { default as uiReducer } from './uiSlice';

// Export actions from each slice
// Game slice actions
export {
  setGamePhase,
  setGameMode,
  updateGameSettings,
  setTurnupCard as setGameTurnupCard,
  setCurrentPlayerIndex,
  setCurrentTrickLeader,
  setRoundNumber,
  setTricksPlayed,
  setGameStarted,
  setError as setGameError,
  setLoading as setGameLoading,
  setLastAction as setGameLastAction,
  addTrickToHistory,
  clearTrickHistory,
  startNewRound,
  finishGame,
  resetGame,
  // Also export all selectors
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
  selectLastAction,
} from './game';

// Player slice actions
export {
  addPlayer,
  removePlayer,
  updatePlayer,
  setPlayers,
  batchUpdatePlayers,
  addCardToHand,
  removeCardFromHand,
  updateTricksWon,
  updateScore,
  setBidCards,
  toggleRevealBid,
  resetPlayersForNewRound,
} from './player/playerSlice';

// Bidding slice actions
export {
  startBidding,
  placeBid,
  startBidReveal,
  revealBid,
  completeBiddingPhase,
  resetBidding,
  placeBidAndUpdatePlayer,
  revealBidAndUpdatePlayer,
} from './bidding/biddingSlice';

// Card play slice actions
export {
  initializeDeck,
  setPlayOrder,
  initializeNewTrick,
  playCard,
  completeTrick,
  dealCards,
  addCardToPlay,
  resetCardPlay,
  playCardAndUpdatePlayer,
  completeTrickAndUpdateWinner,
} from './cardPlay/cardPlaySlice';

// Card slice actions
export {
  addCard,
  updateCard,
  removeCard,
  addStack,
  updateStack,
  removeStack,
  moveCard,
  flipCard,
  setCardLoading,
  setCardError,
  setStackLoading,
  setStackError,
  clearErrors,
  reset as resetCardState,
} from './cardSlice';

// UI slice actions
export {
  setDarkMode,
  setSoundEnabled,
  setAnimationEnabled,
  setCardScale,
  setCardArrangement,
  setCurrentView,
  setFullscreen,
  setSelectedTheme,
  setLoading as setUiLoading,
  setError as setUiError,
  addNotification,
  removeNotification,
  clearAllNotifications,
} from './uiSlice'; 