/**
 * @fileoverview Real-time provider for game state synchronization
 */

'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { useRealtime } from '@/app/lib/realtime/useRealtime';
import { GameSync } from '@/app/lib/realtime/GameSync';
import { useAppDispatch, useAppSelector } from '@/app/game/store/store';
import { selectGameState } from '@/app/game/store/slices/game/gameSelectors';
import { selectAllPlayers } from '@/app/game/store/slices/player/playerSelectors';
import { setError } from '@/app/game/store/slices/game/gameSlice';

interface RealtimeProviderProps {
  children: ReactNode;
  sessionId: string;
  userId: string;
}

/**
 * Real-time provider component for game synchronization
 */
export default function RealtimeProvider({ children, sessionId, userId }: RealtimeProviderProps) {
  const dispatch = useAppDispatch();
  const gameState = useAppSelector(selectGameState);
  const players = useAppSelector(selectAllPlayers);
  
  const { 
    isConnected, 
    error: connectionError, 
    connect, 
    disconnect, 
    addEventListener, 
    removeEventListener 
  } = useRealtime(userId);
  
  const [gameSync, setGameSync] = useState<GameSync | null>(null);
  
  // Connect to real-time session
  useEffect(() => {
    if (!sessionId || !userId) return;
    
    // Connect to the game session
    connect(sessionId).catch(error => {
      dispatch(setError({
        type: 'NETWORK',
        message: 'Failed to connect to game session',
        details: error,
      }));
    });
    
    // Clean up on unmount
    return () => {
      disconnect();
    };
  }, [sessionId, userId, connect, disconnect, dispatch]);
  
  // Set up game sync
  useEffect(() => {
    if (!isConnected) {
      setGameSync(null);
      return;
    }
    
    const getState = () => {
      // Access to store state for game sync
      const state = {
        game: gameState,
        player: { entities: {} }, // We only need to sync players
      };
      
      // Add players to the state
      players.forEach(player => {
        state.player.entities[player.id] = player;
      });
      
      return state as any;
    };
    
    // Create game sync instance
    const sync = new GameSync({} as any, dispatch, getState);
    sync.setSessionId(sessionId);
    setGameSync(sync);
    
    // Send initial sync
    sync.sendFullSync();
    
    // Schedule periodic syncs
    const intervalId = setInterval(() => {
      if (sync) {
        sync.sendFullSync();
      }
    }, 10000); // Sync every 10 seconds
    
    return () => {
      clearInterval(intervalId);
      setGameSync(null);
    };
  }, [isConnected, sessionId, dispatch, gameState, players]);
  
  // Show connection error state
  if (connectionError) {
    return (
      <div className="realtime-error">
        <h3>Connection Error</h3>
        <p>{connectionError}</p>
        <button onClick={() => connect(sessionId)}>Reconnect</button>
      </div>
    );
  }
  
  return (
    <div className={`realtime-provider ${isConnected ? 'connected' : 'disconnected'}`}>
      {children}
      {!isConnected && (
        <div className="connection-status">
          <p>Connecting to game session...</p>
        </div>
      )}
    </div>
  );
} 