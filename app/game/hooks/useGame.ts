import { useDispatch, useSelector } from 'react-redux';
import { useMemo } from 'react';
import { createSelector } from '@reduxjs/toolkit';
import type { RootState, AppDispatch } from '../store/store';

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
const selectGamePhase = (state: RootState) => state.game.gamePhase;

const selectDeck = createSelector(
  [(state: RootState) => state.cardPlay.deckIds, (state: RootState) => state.cardPlay.cardsInPlay],
  (deckIds, cardsInPlay) => deckIds.map(id => cardsInPlay[id])
);

const selectTurnupCard = createSelector(
  [(state: RootState) => state.game.turnupCardId, (state: RootState) => state.cardPlay.cardsInPlay],
  (turnupCardId, cardsInPlay) => turnupCardId ? cardsInPlay[turnupCardId] : null
);

const selectPlayers = createSelector(
  [(state: RootState) => state.player.ids, (state: RootState) => state.player.entities],
  (ids, entities) => ids.map(id => entities[id])
);

const selectCurrentTrick = createSelector(
  [(state: RootState) => state.cardPlay.currentTrick.playerCardMap, (state: RootState) => state.cardPlay.cardsInPlay],
  (trickMap, cardsInPlay) => {
    return Object.values(trickMap)
      .filter(cardId => cardId !== null)
      .map(cardId => cardId ? cardsInPlay[cardId] : null)
      .filter(Boolean);
  }
);

const selectCurrentTrickLeader = (state: RootState) => state.game.currentTrickLeader;
const selectError = (state: RootState) => state.game.error;
const selectIsLoading = (state: RootState) => state.game.isLoading;
const selectLastAction = (state: RootState) => state.game.lastAction;
const selectGameStarted = (state: RootState) => state.game.gameStarted;
const selectCurrentPlayerIndex = (state: RootState) => state.game.currentPlayerIndex;
// New selectors
const selectRoundNumber = (state: RootState) => state.game.roundNumber;
const selectGameMode = (state: RootState) => state.game.gameMode;
const selectTrickHistory = (state: RootState) => state.game.trickHistory;
const selectGameSettings = (state: RootState) => state.game.gameSettings;

export const useGame = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Selectors with memoization
  const gamePhase = useSelector(selectGamePhase);
  const deck = useSelector(selectDeck);
  const turnupCard = useSelector(selectTurnupCard);
  const players = useSelector(selectPlayers);
  const currentTrick = useSelector(selectCurrentTrick);
  const currentTrickLeader = useSelector(selectCurrentTrickLeader);
  const error = useSelector(selectError);
  const isLoading = useSelector(selectIsLoading);
  const lastAction = useSelector(selectLastAction);
  const gameStarted = useSelector(selectGameStarted);
  const currentPlayerIndex = useSelector(selectCurrentPlayerIndex);
  // New state
  const roundNumber = useSelector(selectRoundNumber);
  const gameMode = useSelector(selectGameMode);
  const trickHistory = useSelector(selectTrickHistory);
  const gameSettings = useSelector(selectGameSettings);

  // Memoized actions
  const actions = useMemo(
    () => ({
      setGamePhase: (phase: GamePhase) => dispatch(setGamePhase(phase)),
      setDeck: (cards: CardType[]) => dispatch(initializeDeck()),
      setTurnupCard: (card: CardType | null) => dispatch(setGameTurnupCard(card?.id || null)),
      setPlayers: (players: Player[]) => dispatch(setPlayers(players)),
      setCurrentTrickLeader: (leader: number) => dispatch(setCurrentTrickLeader(leader)),
      setError: (error: GameError | null) => dispatch(setGameError(error)),
      setLoading: (loading: boolean) => dispatch(setGameLoading(loading)),
      setLastAction: (action: string | null) => dispatch(setGameLastAction(action)),
      setGameStarted: (started: boolean) => dispatch(setGameStarted(started)),
      setCurrentPlayerIndex: (index: number) => dispatch(setCurrentPlayerIndex(index)),
      dealCards: () => dispatch(dealCards({ numPlayers: players.length, cardsPerPlayer: gameSettings.cardsPerPlayer })),
      playCard: (playerId: string, card: CardType) => dispatch(playCard({ playerId, card })),
      placeBid: (playerId: string, bidCards: CardType[]) => dispatch(placeBid({ playerId, bidCards })),
      revealBid: (playerId: string) => dispatch(revealBid({ playerId })),
      // New actions
      setRoundNumber: (round: number) => dispatch(setRoundNumber(round)),
      setGameMode: (mode: GameMode) => dispatch(setGameMode(mode)),
      updateGameSettings: (settings: Partial<GameSettings>) => dispatch(updateGameSettings(settings)),
      addTrickToHistory: (trick: Omit<TrickHistory, 'id' | 'timestamp'>) => dispatch(addTrickToHistory(trick)),
      clearTrickHistory: () => dispatch(clearTrickHistory()),
    }),
    [dispatch, players.length, gameSettings.cardsPerPlayer]
  );

  // Memoized derived state
  const currentPlayer = useMemo(
    () => players[currentPlayerIndex],
    [players, currentPlayerIndex]
  );

  const isCurrentPlayerActive = useMemo(
    () => currentPlayer?.isActive ?? false,
    [currentPlayer]
  );

  const canPlayCard = useMemo(
    () => gamePhase === 'playing' && isCurrentPlayerActive && !isLoading,
    [gamePhase, isCurrentPlayerActive, isLoading]
  );

  // New derived state
  const isRoundComplete = useMemo(
    () => gameSettings.maxTricks > 0 && trickHistory.ids.length >= gameSettings.maxTricks,
    [gameSettings.maxTricks, trickHistory.ids.length]
  );

  const isGameComplete = useMemo(
    () => gameSettings.maxRounds > 0 && roundNumber > gameSettings.maxRounds,
    [gameSettings.maxRounds, roundNumber]
  );

  // Memoized return value
  return useMemo(
    () => ({
      // State
      gamePhase,
      deck,
      turnupCard,
      players,
      currentTrick,
      currentTrickLeader,
      error,
      isLoading,
      lastAction,
      gameStarted,
      currentPlayerIndex,
      currentPlayer,
      isCurrentPlayerActive,
      canPlayCard,
      // New state
      roundNumber,
      gameMode,
      trickHistory,
      gameSettings,
      isRoundComplete,
      isGameComplete,
      // Actions
      ...actions,
    }),
    [
      gamePhase,
      deck,
      turnupCard,
      players,
      currentTrick,
      currentTrickLeader,
      error,
      isLoading,
      lastAction,
      gameStarted,
      currentPlayerIndex,
      currentPlayer,
      isCurrentPlayerActive,
      canPlayCard,
      roundNumber,
      gameMode,
      trickHistory,
      gameSettings,
      isRoundComplete,
      isGameComplete,
      actions,
    ]
  );
}; 