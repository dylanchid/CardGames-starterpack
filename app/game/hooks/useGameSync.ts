/**
 * @fileoverview Hook for real-time game synchronization
 */

import { useEffect, useRef } from 'react';
import { useGame } from '../components/core/GameProvider';
import { RealtimeManager } from '@/app/lib/realtime/RealtimeManager';
import { GameState as AppGameState } from '@/app/types/core/GameTypes';
import { GameState as RealtimeGameState } from '@/app/game/types/core/GameTypes';
import { GameStateAdapter } from '../adapters/GameStateAdapter';
import { SupabaseClient } from '@supabase/supabase-js';

// Extend Window interface to include Supabase client
declare global {
  interface Window {
    supabase: SupabaseClient;
  }
}

export const useGameSync = (sessionId: string) => {
  const { state, actions } = useGame();
  const realtimeManagerRef = useRef<RealtimeManager | null>(null);
  
  useEffect(() => {
    // Initialize real-time manager
    const initializeRealtime = async () => {
      try {
        // TODO: Get Supabase client from context or environment
        const supabase = window.supabase;
        
        if (!supabase) {
          throw new Error('Supabase client not initialized');
        }
        
        // Create real-time manager with required userId
        realtimeManagerRef.current = new RealtimeManager(supabase, sessionId, 'current-user-id');
        
        // Set up state change handler
        realtimeManagerRef.current.onStateChange((newState: RealtimeGameState) => {
          // Convert realtime state to app state and merge
          const appState = GameStateAdapter.toAppState(newState);
          mergeStates(appState);
        });
        
        // Set up error handler
        realtimeManagerRef.current.onError((error: Error) => {
          actions.setError(error.message);
        });
        
        // Set up connection handlers
        realtimeManagerRef.current.onDisconnect(() => {
          actions.setError('Connection lost. Attempting to reconnect...');
        });
        
        realtimeManagerRef.current.onReconnect(() => {
          actions.setError(null);
        });
        
        // Initialize connection
        await realtimeManagerRef.current.initialize();
        
        // Send initial state
        await realtimeManagerRef.current.updateState(GameStateAdapter.toRealtimeState(state));
      } catch (error) {
        console.error('Error initializing real-time sync:', error);
        actions.setError('Failed to initialize real-time sync');
      }
    };
    
    // Initialize
    initializeRealtime();
    
    // Cleanup
    return () => {
      if (realtimeManagerRef.current) {
        realtimeManagerRef.current.cleanup();
      }
    };
  }, [sessionId]);
  
  // Effect to sync state changes
  useEffect(() => {
    if (realtimeManagerRef.current) {
      // Convert app state to realtime state and send
      realtimeManagerRef.current.updateState(GameStateAdapter.toRealtimeState(state));
    }
  }, [state]);
  
  // Helper function to merge states
  const mergeStates = (remoteState: AppGameState) => {
    // Core state
    if (remoteState.core.phase !== state.core.phase) {
      actions.setPhase(remoteState.core.phase);
    }
    
    if (JSON.stringify(remoteState.core.settings) !== JSON.stringify(state.core.settings)) {
      actions.updateSettings(remoteState.core.settings);
    }
    
    // Entities
    Object.entries(remoteState.entities.players).forEach(([id, player]) => {
      if (!state.entities.players[id] || 
          JSON.stringify(state.entities.players[id]) !== JSON.stringify(player)) {
        actions.updatePlayer(player);
      }
    });
    
    Object.entries(remoteState.entities.tricks).forEach(([id, trick]) => {
      if (!state.entities.tricks[id] || 
          JSON.stringify(state.entities.tricks[id]) !== JSON.stringify(trick)) {
        actions.updateTrick(trick);
      }
    });
    
    Object.entries(remoteState.entities.bids).forEach(([id, bid]) => {
      if (!state.entities.bids[id] || 
          JSON.stringify(state.entities.bids[id]) !== JSON.stringify(bid)) {
        actions.updateBid(bid);
      }
    });
    
    // Relationships
    if (remoteState.relationships.currentTrick !== state.relationships.currentTrick) {
      actions.setCurrentTrick(remoteState.relationships.currentTrick);
    }
    
    if (remoteState.relationships.currentPlayer !== state.relationships.currentPlayer) {
      actions.setCurrentPlayer(remoteState.relationships.currentPlayer);
    }
    
    if (remoteState.relationships.currentBidder !== state.relationships.currentBidder) {
      actions.setCurrentBidder(remoteState.relationships.currentBidder);
    }
    
    // UI state
    if (JSON.stringify(remoteState.ui.selectedCards) !== JSON.stringify(state.ui.selectedCards)) {
      actions.setSelectedCards(remoteState.ui.selectedCards);
    }
    
    if (remoteState.ui.draggedCard !== state.ui.draggedCard) {
      actions.setDraggedCard(remoteState.ui.draggedCard);
    }
    
    if (remoteState.ui.animationState.isAnimating !== state.ui.animationState.isAnimating) {
      actions.setAnimationState(remoteState.ui.animationState);
    }
  };
  
  return {
    isConnected: realtimeManagerRef.current?.isConnected() ?? false,
  };
}; 