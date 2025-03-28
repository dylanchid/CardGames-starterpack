/**
 * @fileoverview Root game component that combines all providers
 */

'use client';

import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import { GameProvider } from './core/GameContext';
import { BiddingProvider } from './features/bidding/BiddingProvider';
import { CardPlayProvider } from './features/cardPlay/CardPlayProvider';
import RealtimeProvider from './realtime/RealtimeProvider';
import ErrorBoundary from './ErrorBoundary';
import DndProvider from './DndProvider';
import { GameProvider as GameBoardProvider } from './GameBoard/GameProvider';

/**
 * Props for GameRoot
 */
interface GameRootProps {
  children: ReactNode;
  sessionId?: string;
  userId?: string;
}

/**
 * Root game component that combines all providers
 * Provides a clean hierarchy of contexts for the game
 */
export default function GameRoot({ children, sessionId, userId }: GameRootProps) {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <DndProvider>
          <GameProvider>
            <BiddingProvider>
              <CardPlayProvider>
                <GameBoardProvider>
                  {sessionId && userId ? (
                    <RealtimeProvider sessionId={sessionId} userId={userId}>
                      {children}
                    </RealtimeProvider>
                  ) : (
                    children
                  )}
                </GameBoardProvider>
              </CardPlayProvider>
            </BiddingProvider>
          </GameProvider>
        </DndProvider>
      </Provider>
    </ErrorBoundary>
  );
} 