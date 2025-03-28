/**
 * @fileoverview Core game context provider
 */

'use client';

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { startGame, dealCardsForRound, startNewRound } from '../../store/gameThunks';
import { 
  selectGameState, 
  selectGamePhase, 
  selectGameSettings, 
  selectRoundNumber, 
  selectIsGameOver
} from '../../store/slices/game/gameSelectors';
import { selectAllPlayers, selectCurrentPlayer } from '../../store/slices/player/playerSelectors';
import { GameError } from '../../types/core/GameTypes';
import { setError } from '../../store/slices/game/gameSlice';

/**
 * Game context interface
 */
interface GameContextValue {
  // Game state
  gamePhase: string;
  roundNumber: number;
  isLoading: boolean;
  error: GameError | null;
  isGameOver: boolean;
  
  // Game actions
  startGame: (numPlayers: number) => Promise<void>;
  startNewRound: () => Promise<void>;
  dealCards: () => Promise<void>;
  resetError: () => void;
  
  // Game settings
  settings: {
    maxRounds: number;
    maxTricks: number;
    cardsPerPlayer: number;
  };
}

// Create context
const GameContext = createContext<GameContextValue | undefined>(undefined);

/**
 * Props for GameProvider
 */
interface GameProviderProps {
  children: ReactNode;
}

/**
 * Game context provider
 */
export function GameProvider({ children }: GameProviderProps) {
  const dispatch = useAppDispatch();
  
  // Selectors
  const gameState = useAppSelector(selectGameState);
  const gamePhase = useAppSelector(selectGamePhase);
  const gameSettings = useAppSelector(selectGameSettings);
  const roundNumber = useAppSelector(selectRoundNumber);
  const isGameOver = useAppSelector(selectIsGameOver);
  const players = useAppSelector(selectAllPlayers);
  const currentPlayer = useAppSelector(selectCurrentPlayer);
  
  // Game actions
  const handleStartGame = async (numPlayers: number) => {
    await dispatch(startGame(numPlayers));
  };
  
  const handleStartNewRound = async () => {
    await dispatch(startNewRound());
  };
  
  const handleDealCards = async () => {
    await dispatch(dealCardsForRound());
  };
  
  const resetError = () => {
    dispatch(setError(null));
  };
  
  // Create context value
  const contextValue = useMemo<GameContextValue>(() => ({
    // Game state
    gamePhase,
    roundNumber,
    isLoading: gameState.isLoading,
    error: gameState.error,
    isGameOver,
    
    // Game actions
    startGame: handleStartGame,
    startNewRound: handleStartNewRound,
    dealCards: handleDealCards,
    resetError,
    
    // Game settings
    settings: {
      maxRounds: gameSettings.maxRounds,
      maxTricks: gameSettings.maxTricks,
      cardsPerPlayer: gameSettings.cardsPerPlayer,
    },
  }), [
    gamePhase,
    roundNumber,
    gameState.isLoading,
    gameState.error,
    isGameOver,
    gameSettings,
  ]);
  
  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}

/**
 * Hook to use the game context
 */
export function useGame() {
  const context = useContext(GameContext);
  
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  
  return context;
} 