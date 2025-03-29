/**
 * @fileoverview Hook for handling game persistence and loading
 */

import { useCallback, useEffect } from 'react';
import { useGame } from '../components/core/GameProvider';
import { GameState } from '@/app/types/core/GameTypes';

const STORAGE_KEY = 'ninety-nine-game-state';

export const useGamePersistence = () => {
  const { state, actions } = useGame();
  
  // Save game state to localStorage
  const saveGameState = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving game state:', error);
    }
  }, [state]);
  
  // Load game state from localStorage
  const loadGameState = useCallback(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (!savedState) return null;
      
      const parsedState = JSON.parse(savedState) as GameState;
      
      // Validate loaded state
      if (!isValidGameState(parsedState)) {
        console.error('Invalid game state loaded');
        return null;
      }
      
      return parsedState;
    } catch (error) {
      console.error('Error loading game state:', error);
      return null;
    }
  }, []);
  
  // Clear saved game state
  const clearGameState = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing game state:', error);
    }
  }, []);
  
  // Auto-save effect
  useEffect(() => {
    // Save state when it changes
    saveGameState();
    
    // Set up auto-save interval
    const interval = setInterval(saveGameState, 60000); // Save every minute
    
    return () => clearInterval(interval);
  }, [saveGameState]);
  
  // Load saved state on mount
  useEffect(() => {
    const handleLoad = async () => {
      const savedState = loadGameState();
      if (savedState) {
        // Restore state
        restoreGameState(savedState);
      }
    };
    
    handleLoad();
  }, [loadGameState]);
  
  // Helper function to validate game state
  const isValidGameState = (state: any): state is GameState => {
    // Check required properties
    if (!state || typeof state !== 'object') return false;
    if (!state.core || typeof state.core !== 'object') return false;
    if (!state.entities || typeof state.entities !== 'object') return false;
    if (!state.relationships || typeof state.relationships !== 'object') return false;
    if (!state.ui || typeof state.ui !== 'object') return false;
    
    // Check core properties
    if (!state.core.phase || typeof state.core.phase !== 'string') return false;
    if (!state.core.settings || typeof state.core.settings !== 'object') return false;
    if (state.core.error !== null && typeof state.core.error !== 'string') return false;
    if (state.core.lastAction !== null && typeof state.core.lastAction !== 'string') return false;
    if (state.core.lastActionTimestamp !== null && typeof state.core.lastActionTimestamp !== 'number') return false;
    
    // Check entities
    if (!state.entities.players || typeof state.entities.players !== 'object') return false;
    if (!state.entities.tricks || typeof state.entities.tricks !== 'object') return false;
    if (!state.entities.bids || typeof state.entities.bids !== 'object') return false;
    
    // Check relationships
    if (!Array.isArray(state.relationships.playerOrder)) return false;
    if (state.relationships.currentTrick !== null && typeof state.relationships.currentTrick !== 'string') return false;
    if (state.relationships.currentPlayer !== null && typeof state.relationships.currentPlayer !== 'string') return false;
    if (state.relationships.currentBidder !== null && typeof state.relationships.currentBidder !== 'string') return false;
    
    // Check UI
    if (!Array.isArray(state.ui.selectedCards)) return false;
    if (state.ui.draggedCard !== null && typeof state.ui.draggedCard !== 'string') return false;
    if (!state.ui.animationState || typeof state.ui.animationState !== 'object') return false;
    
    return true;
  };
  
  // Helper function to restore game state
  const restoreGameState = useCallback((savedState: GameState) => {
    try {
      // Restore core state
      actions.setPhase(savedState.core.phase);
      actions.updateSettings(savedState.core.settings);
      actions.setError(savedState.core.error);
      
      // Restore entities
      Object.values(savedState.entities.players).forEach(player => {
        actions.addPlayer(player);
      });
      
      Object.values(savedState.entities.tricks).forEach(trick => {
        actions.addTrick(trick);
      });
      
      Object.values(savedState.entities.bids).forEach(bid => {
        actions.addBid(bid);
      });
      
      // Restore relationships
      actions.setCurrentTrick(savedState.relationships.currentTrick);
      actions.setCurrentPlayer(savedState.relationships.currentPlayer);
      actions.setCurrentBidder(savedState.relationships.currentBidder);
      
      // Restore UI state
      actions.setSelectedCards(savedState.ui.selectedCards);
      actions.setDraggedCard(savedState.ui.draggedCard);
      actions.setAnimationState(savedState.ui.animationState);
    } catch (error) {
      console.error('Error restoring game state:', error);
      actions.setError('Failed to restore game state');
    }
  }, [actions]);
  
  return {
    saveGameState,
    loadGameState,
    clearGameState,
    restoreGameState,
  };
}; 