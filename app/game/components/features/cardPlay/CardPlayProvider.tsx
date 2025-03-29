/**
 * @fileoverview Card play provider component
 */

'use client';

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/game/store/store';
import { playCardAction } from '@/app/game/store/gameThunks';
import { CardPlayContextValue } from '@/app/game/types/core/ContextTypes';
import { 
  selectCardPlayState,
  selectCurrentTrick,
  selectTrickNumber,
  selectPlayOrder,
  selectCardPlayCurrentPlayerIndex,
  selectCurrentTrickCards,
  selectIsCurrentTrickComplete,
  selectCurrentTrickLeadSuit,
  selectCurrentTrickWinnerIndex,
  selectCardPlayCurrentPlayerId,
  selectValidCardsToPlay,
  selectCurrentPlayerValidCards
} from '@/app/game/store/slices/cardPlay/cardPlaySelectors';
import { CardType } from '@/app/game/types/card';
import { 
  initializeNewTrick, 
  playCard, 
  completeTrick,
  resetCardPlay 
} from '@/app/game/store/slices/cardPlay/cardPlaySlice';

// Create context
const CardPlayContext = createContext<CardPlayContextValue | undefined>(undefined);

/**
 * Props for CardPlayProvider
 */
interface CardPlayProviderProps {
  children: ReactNode;
}

/**
 * Card play provider component
 */
export function CardPlayProvider({ children }: CardPlayProviderProps) {
  const dispatch = useAppDispatch();
  
  // Selectors
  const cardPlayState = useAppSelector(selectCardPlayState);
  const currentTrick = useAppSelector(selectCurrentTrick);
  const trickNumber = useAppSelector(selectTrickNumber);
  const playOrder = useAppSelector(selectPlayOrder);
  const currentPlayerIndex = useAppSelector(selectCardPlayCurrentPlayerIndex);
  const currentTrickCards = useAppSelector(selectCurrentTrickCards);
  const isCurrentTrickComplete = useAppSelector(selectIsCurrentTrickComplete);
  const currentTrickLeadSuit = useAppSelector(selectCurrentTrickLeadSuit);
  const currentTrickWinnerIndex = useAppSelector(selectCurrentTrickWinnerIndex);
  const currentPlayerId = useAppSelector(selectCardPlayCurrentPlayerId);
  const currentPlayerValidCards = useAppSelector(selectCurrentPlayerValidCards);
  
  // Card play actions
  const handlePlayCard = async (playerId: string, card: CardType) => {
    await dispatch(playCardAction({ playerId, card }));
  };
  
  const handleInitializeNewTrick = (leadPlayerIndex: number) => {
    dispatch(initializeNewTrick(leadPlayerIndex));
  };
  
  const handleCompleteTrick = (winnerIndex: number, winnerId: string, trickNumber: number) => {
    dispatch(completeTrick({ winnerIndex, winnerId, trickNumber }));
  };
  
  const handleResetCardPlay = () => {
    dispatch(resetCardPlay());
  };
  
  // Card play queries
  const getValidCardsToPlay = (playerId: string) => {
    return useAppSelector((state) => selectValidCardsToPlay(state, playerId));
  };
  
  // Create context value
  const contextValue = useMemo<CardPlayContextValue>(() => ({
    // Card play state
    currentTrick: {
      cards: currentTrickCards,
      leadSuit: currentTrickLeadSuit,
      isComplete: isCurrentTrickComplete,
      winnerIndex: currentTrickWinnerIndex,
    },
    trickNumber,
    currentPlayerIndex,
    currentPlayerId,
    
    // Card play actions
    playCard: handlePlayCard,
    initializeNewTrick: handleInitializeNewTrick,
    completeTrick: handleCompleteTrick,
    resetCardPlay: handleResetCardPlay,
    
    // Card play queries
    getValidCardsToPlay,
    getCurrentPlayerValidCards: () => currentPlayerValidCards,
  }), [
    currentTrickCards,
    currentTrickLeadSuit,
    isCurrentTrickComplete,
    currentTrickWinnerIndex,
    trickNumber,
    currentPlayerIndex,
    currentPlayerId,
    currentPlayerValidCards,
  ]);
  
  return (
    <CardPlayContext.Provider value={contextValue}>
      {children}
    </CardPlayContext.Provider>
  );
}

/**
 * Hook to use the card play context
 */
export function useCardPlay() {
  const context = useContext(CardPlayContext);
  
  if (context === undefined) {
    throw new Error('useCardPlay must be used within a CardPlayProvider');
  }
  
  return context;
} 