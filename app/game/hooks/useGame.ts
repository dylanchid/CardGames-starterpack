import { useMemo, useCallback } from 'react';
import { createSelector } from '@reduxjs/toolkit';
import { useAppDispatch, useAppSelector } from '../store/store';
import { RootState } from '../store/store';
import { GameContext } from '../components/core/GameProvider';
import React from 'react';

// Import actions from our modular slices
import {
  // Game slice actions
  setGamePhase,
  setGameMode,
  updateGameSettings,
  setGameTurnupCard,
  setCurrentPlayerIndex,
  setCurrentTrickLeader,
  setGameError,
  setGameLoading,
  setGameLastAction,
  setGameStarted,
  setRoundNumber,
  addTrickToHistory,
  clearTrickHistory,
  // Player slice actions
  setPlayers,
  // Card play slice actions
  initializeDeck,
  dealCards,
  playCard,
  // Bidding slice actions
  placeBid,
  revealBid,
} from '../store/slices';

// Import types from respective type files
import { GamePhase, GameMode, GameError, GameSettings } from '../types/core/GameTypes';
import { TrickHistory } from '../types/core/GameTypes';
import { Player } from '../types/core/PlayerTypes';
import { CardType } from '../types/card';

// Memoized selectors using createSelector
const selectGamePhase = (state: RootState) => state.game.core.phase;

const selectDeck = createSelector(
  [(state: RootState) => state.cardPlay?.deckIds ?? [], (state: RootState) => state.cardPlay?.cardsInPlay ?? {}],
  (deckIds, cardsInPlay) => deckIds.map(id => cardsInPlay[id])
);

const selectTurnupCard = createSelector(
  [(state: RootState) => state.game.entities.cards[state.game.relationships.currentTrick ?? ''], (state: RootState) => state.cardPlay?.cardsInPlay ?? {}],
  (turnupCard, cardsInPlay) => turnupCard ? cardsInPlay[turnupCard.id] : null
);

const selectPlayers = createSelector(
  [(state: RootState) => state.game.relationships.playerOrder, (state: RootState) => state.game.entities.players],
  (playerOrder, players) => playerOrder.map(id => players[id])
);

const selectCurrentTrick = createSelector(
  [(state: RootState) => state.cardPlay?.currentTrick?.playerCardMap ?? {}, (state: RootState) => state.cardPlay?.cardsInPlay ?? {}],
  (trickMap, cardsInPlay) => {
    return Object.values(trickMap)
      .filter(cardId => cardId !== null)
      .map(cardId => cardId ? cardsInPlay[cardId] : null)
      .filter(Boolean);
  }
);

const selectCurrentTrickLeader = (state: RootState) => state.game.relationships.currentPlayer;
const selectError = (state: RootState) => state.game.core.error;
const selectIsLoading = (state: RootState) => state.game.core.phase === 'setup';
const selectLastAction = (state: RootState) => state.game.core.lastAction;
const selectGameStarted = (state: RootState) => state.game.core.phase !== 'setup';
const selectCurrentPlayerIndex = (state: RootState) => 
  state.game.relationships.playerOrder.indexOf(state.game.relationships.currentPlayer ?? '');

// New selectors
const selectRoundNumber = (state: RootState) => Object.keys(state.game.entities.tricks).length;
const selectGameMode = (state: RootState) => state.game.core.settings.autoPlay ? 'trump' : 'no-trump';
const selectTrickHistory = (state: RootState) => ({
  ids: Object.keys(state.game.entities.tricks),
  entities: state.game.entities.tricks,
});
const selectGameSettings = (state: RootState) => state.game.core.settings;

export const useGame = () => {
  const context = React.useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}; 