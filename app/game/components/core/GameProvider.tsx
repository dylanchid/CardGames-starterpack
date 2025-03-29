/**
 * @fileoverview Unified game provider component
 */

'use client';

import React, { createContext, useContext, useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GameContextValue, Player, Trick, Bid as ExternalBid, GameError, GamePhase, GameSettings } from '../../../types/core/GameTypes';
import { GameState, Bid as InternalBid } from '../../types/core/GameTypes';
import {
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
} from '../../store/slices/game/gameSlice';
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
  selectGameLoading,
  selectGameStarted,
  selectRoundNumber,
  selectTricksPlayed,
} from '../../store/slices/game/gameSelectors';
import { RootState } from '../../store/store';
import { useGameSync } from '../../hooks/useGameSync';
import { handleAITurn } from '../../services/ai';
import { 
  adaptGameStateReverse, 
  adaptPlayer, 
  adaptTrickReverse, 
  adaptBidReverse, 
  adaptToNinetyNineState,
  adaptGamePhase,
  adaptPlayerReverse,
  adaptTrick,
  adaptBid
} from '../../types/core/TypeAdapters';

const GameContext = createContext<GameContextValue | null>(null);

export { GameContext };

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const state = useSelector(selectGameState);
  const phase = useSelector(selectGamePhase);
  const settings = useSelector(selectGameSettings);
  const error = useSelector(selectGameError);
  const lastAction = useSelector(selectLastAction);
  const lastActionTimestamp = useSelector(selectLastActionTimestamp);
  const players = useSelector(selectPlayerOrderData);
  const currentTrick = useSelector(selectCurrentTrickData);
  const currentPlayer = useSelector(selectCurrentPlayerData);
  const currentPlayerIndex = useSelector(selectCurrentPlayerIndex);
  const isLoading = useSelector(selectGameLoading);
  const gameStarted = useSelector(selectGameStarted);
  const roundNumber = useSelector(selectRoundNumber);
  const tricksPlayed = useSelector(selectTricksPlayed);

  // Actions
  const actions = {
    setPhase: useCallback((phase: GamePhase) => {
      dispatch(setPhase(adaptGamePhase(phase)));
    }, [dispatch]),
    
    updateSettings: useCallback((settings: Partial<GameSettings>) => {
      dispatch(updateSettings(settings));
    }, [dispatch]),
    
    setError: useCallback((error: string | null) => {
      if (error === null) {
        dispatch(setError(null));
      } else {
        dispatch(setError({
          type: 'GAME_STATE',
          message: error,
          details: {}
        }));
      }
    }, [dispatch]),
    
    addPlayer: useCallback((player: Player) => {
      dispatch(addPlayer(adaptPlayerReverse(player)));
    }, [dispatch]),
    
    updatePlayer: useCallback((player: Player) => {
      dispatch(updatePlayer(adaptPlayerReverse(player)));
    }, [dispatch]),
    
    removePlayer: useCallback((playerId: string) => {
      dispatch(removePlayer(playerId));
    }, [dispatch]),
    
    addTrick: useCallback((trick: Trick) => {
      dispatch(addTrick(adaptTrick(trick)));
    }, [dispatch]),
    
    updateTrick: useCallback((trick: Trick) => {
      dispatch(updateTrick(adaptTrick(trick)));
    }, [dispatch]),
    
    addBid: useCallback((bid: ExternalBid) => {
      dispatch(addBid(adaptBid(bid)));
    }, [dispatch]),
    
    updateBid: useCallback((bid: ExternalBid) => {
      dispatch(updateBid(adaptBid(bid)));
    }, [dispatch]),
    
    setCurrentTrick: useCallback((trickId: string | null) => {
      dispatch(setCurrentTrick(trickId));
    }, [dispatch]),
    
    setCurrentPlayer: useCallback((playerId: string | null) => {
      dispatch(setCurrentPlayer(playerId));
    }, [dispatch]),
    
    setCurrentBidder: useCallback((playerId: string | null) => {
      dispatch(setCurrentBidder(playerId));
    }, [dispatch]),
    
    setSelectedCards: useCallback((cardIds: string[]) => {
      dispatch(setSelectedCards(cardIds));
    }, [dispatch]),
    
    setDraggedCard: useCallback((cardId: string | null) => {
      dispatch(setDraggedCard(cardId));
    }, [dispatch]),
    
    setAnimationState: useCallback((animationState: {
      isAnimating: boolean;
      currentAnimation: string | null;
      animationQueue: string[];
    }) => {
      dispatch(setAnimationState(animationState));
    }, [dispatch]),
    
    resetGame: useCallback(() => {
      dispatch(resetGame());
    }, [dispatch]),

    revealBids: useCallback(() => {
      dispatch({ type: 'game/revealBids' });
    }, [dispatch]),

    playCard: useCallback((cardId: string) => {
      dispatch({ type: 'game/playCard', payload: cardId });
    }, [dispatch]),

    cancelAction: useCallback(() => {
      dispatch({ type: 'game/cancelAction' });
    }, [dispatch]),

    setGameStarted: useCallback((started: boolean) => {
      dispatch({ type: 'game/setGameStarted', payload: started });
    }, [dispatch]),

    setRoundNumber: useCallback((round: number) => {
      dispatch({ type: 'game/setRoundNumber', payload: round });
    }, [dispatch]),

    startNewRound: useCallback(() => {
      dispatch({ type: 'game/startNewRound' });
    }, [dispatch]),

    setTurnupCard: useCallback((cardId: string | null) => {
      dispatch({ type: 'game/setTurnupCard', payload: cardId });
    }, [dispatch]),
  };

  // Queries
  const queries = {
    getPhase: useCallback(() => phase, [phase]),
    getSettings: useCallback(() => settings, [settings]),
    getError: useCallback(() => error, [error]),
    getLastAction: useCallback(() => lastAction, [lastAction]),
    getLastActionTimestamp: useCallback(() => lastActionTimestamp, [lastActionTimestamp]),
    getPlayer: useCallback((playerId: string) => {
      const player = useSelector((state: RootState) => selectPlayerById(state, playerId));
      return player ? adaptPlayer(player) : undefined;
    }, []),
    getTrick: useCallback((trickId: string) => {
      const trick = useSelector((state: RootState) => selectTrickById(state, trickId));
      return trick ? adaptTrickReverse(trick) : undefined;
    }, []),
    getBid: useCallback((bidId: string) => {
      const bid = useSelector((state: RootState) => selectBidById(state, bidId));
      return bid ? adaptBidReverse(bid) : undefined;
    }, []),
    getCurrentTrick: useCallback(() => {
      const currentTrick = useSelector(selectCurrentTrickData);
      return currentTrick ? adaptTrickReverse(currentTrick) : undefined;
    }, []),
    getCurrentPlayer: useCallback(() => {
      const currentPlayer = useSelector(selectCurrentPlayerData);
      return currentPlayer ? adaptPlayer(currentPlayer) : undefined;
    }, []),
    getCurrentBidder: useCallback(() => {
      const currentBidder = useSelector(selectCurrentBidderData);
      return currentBidder ? adaptPlayer(currentBidder) : undefined;
    }, []),
    getPlayerOrder: useCallback(() => {
      const playerOrder = useSelector(selectPlayerOrderData);
      return playerOrder.map(player => adaptPlayer(player));
    }, []),
    getSelectedCards: useCallback(() => {
      const selectedCards = useSelector(selectSelectedCards);
      return selectedCards;
    }, []),
    getDraggedCard: useCallback(() => {
      const draggedCard = useSelector(selectDraggedCard);
      return draggedCard;
    }, []),
    getAnimationState: useCallback(() => {
      const animationState = useSelector(selectAnimationState);
      return animationState;
    }, []),
    isPlayerTurn: useCallback((playerId: string) => {
      const isPlayerTurn = useSelector((state: RootState) => selectIsPlayerTurn(state, playerId));
      return isPlayerTurn;
    }, []),
    isPlayerBidding: useCallback((playerId: string) => {
      const isPlayerBidding = useSelector((state: RootState) => selectIsPlayerBidding(state, playerId));
      return isPlayerBidding;
    }, []),
    isCardSelected: useCallback((cardId: string) => {
      const isCardSelected = useSelector((state: RootState) => selectIsCardSelected(state, cardId));
      return isCardSelected;
    }, []),
    isCardDragged: useCallback((cardId: string) => {
      const isCardDragged = useSelector((state: RootState) => selectIsCardDragged(state, cardId));
      return isCardDragged;
    }, []),
    isAnimating: useCallback(() => {
      const isAnimating = useSelector(selectIsAnimating);
      return isAnimating;
    }, []),
  };

  // Memoized derived state
  const isCurrentPlayerActive = useMemo(
    () => currentPlayer?.isReady ?? false,
    [currentPlayer]
  );

  const canPlayCard = useMemo(
    () => phase === 'playing' && isCurrentPlayerActive && !isLoading,
    [phase, isCurrentPlayerActive, isLoading]
  );

  const isRoundComplete = useMemo(
    () => tricksPlayed >= 13,
    [tricksPlayed]
  );

  const isGameComplete = useMemo(
    () => phase === 'finished',
    [phase]
  );

  const value = useMemo(() => ({
    state: {
      core: {
        phase: adaptGamePhase(phase),
        roundNumber,
        settings,
        error: typeof error === 'string' ? error : null,
        lastAction,
        lastActionTimestamp,
        turnupCardId: null, // TODO: Add turnupCardId to state
      },
      entities: {
        players: players.reduce((acc, player) => ({
          ...acc,
          [player.id]: adaptPlayer(player)
        }), {}),
        tricks: currentTrick ? {
          [currentTrick.id]: adaptTrickReverse(currentTrick)
        } : {},
        bids: {},
        cards: {},
        stacks: {},
      },
      relationships: {
        playerOrder: players.map(p => p.id),
        currentTrick: currentTrick?.id || null,
        currentPlayer: currentPlayer?.id || null,
        currentBidder: null,
      },
      ui: {
        selectedCards: [] as string[],
        draggedCard: null as string | null,
        animationState: {
          isAnimating: false,
          currentAnimation: null as string | null,
          animationQueue: [] as string[],
        }
      }
    },
    actions: {
      setPhase: actions.setPhase,
      updateSettings: actions.updateSettings,
      setError: actions.setError,
      addPlayer: actions.addPlayer,
      updatePlayer: actions.updatePlayer,
      removePlayer: actions.removePlayer,
      addTrick: actions.addTrick,
      updateTrick: actions.updateTrick,
      addBid: actions.addBid,
      updateBid: actions.updateBid,
      setCurrentTrick: actions.setCurrentTrick,
      setCurrentPlayer: actions.setCurrentPlayer,
      setCurrentBidder: actions.setCurrentBidder,
      setSelectedCards: actions.setSelectedCards,
      setDraggedCard: actions.setDraggedCard,
      setAnimationState: actions.setAnimationState,
      resetGame: actions.resetGame,
      revealBids: actions.revealBids,
      playCard: actions.playCard,
      cancelAction: actions.cancelAction,
    },
    queries: {
      getPhase: queries.getPhase,
      getSettings: queries.getSettings,
      getError: queries.getError,
      getLastAction: queries.getLastAction,
      getLastActionTimestamp: queries.getLastActionTimestamp,
      getPlayer: queries.getPlayer,
      getTrick: queries.getTrick,
      getBid: queries.getBid,
      getCurrentTrick: queries.getCurrentTrick,
      getCurrentPlayer: queries.getCurrentPlayer,
      getCurrentBidder: queries.getCurrentBidder,
      getPlayerOrder: queries.getPlayerOrder,
      getSelectedCards: queries.getSelectedCards,
      getDraggedCard: queries.getDraggedCard,
      getAnimationState: queries.getAnimationState,
      isPlayerTurn: queries.isPlayerTurn,
      isPlayerBidding: queries.isPlayerBidding,
      isCardSelected: queries.isCardSelected,
      isCardDragged: queries.isCardDragged,
      isAnimating: queries.isAnimating,
    }
  }), [
    phase,
    roundNumber,
    settings,
    error,
    lastAction,
    lastActionTimestamp,
    players,
    currentTrick,
    currentPlayer,
    actions,
    queries,
  ]);

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}; 