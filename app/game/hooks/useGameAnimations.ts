/**
 * @fileoverview Hook for handling game animations and transitions
 */

import { useCallback, useEffect } from 'react';
import { useGame } from '../components/core/GameProvider';
import { useGameValidation } from './useGameValidation';

export const useGameAnimations = () => {
  const { state, actions } = useGame();
  const { validateGameState } = useGameValidation();
  
  // Animation helpers
  const animateCardPlay = useCallback(async (cardId: string, fromPlayerId: string, toTrickId: string) => {
    try {
      // Set animation state
      actions.setAnimationState({
        isAnimating: true,
        currentAnimation: 'card_play',
        animationQueue: [cardId],
      });
      
      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Clear animation state
      actions.setAnimationState({
        isAnimating: false,
        currentAnimation: null,
        animationQueue: [],
      });
    } catch (error) {
      console.error('Error animating card play:', error);
    }
  }, [actions]);
  
  const animateTrickComplete = useCallback(async (trickId: string, winnerId: string) => {
    try {
      // Set animation state
      actions.setAnimationState({
        isAnimating: true,
        currentAnimation: 'trick_complete',
        animationQueue: [trickId],
      });
      
      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear animation state
      actions.setAnimationState({
        isAnimating: false,
        currentAnimation: null,
        animationQueue: [],
      });
    } catch (error) {
      console.error('Error animating trick complete:', error);
    }
  }, [actions]);
  
  const animateBidReveal = useCallback(async (bidId: string) => {
    try {
      // Set animation state
      actions.setAnimationState({
        isAnimating: true,
        currentAnimation: 'bid_reveal',
        animationQueue: [bidId],
      });
      
      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Clear animation state
      actions.setAnimationState({
        isAnimating: false,
        currentAnimation: null,
        animationQueue: [],
      });
    } catch (error) {
      console.error('Error animating bid reveal:', error);
    }
  }, [actions]);
  
  const animatePhaseTransition = useCallback(async (fromPhase: string, toPhase: string) => {
    try {
      // Set animation state
      actions.setAnimationState({
        isAnimating: true,
        currentAnimation: 'phase_transition',
        animationQueue: [fromPhase, toPhase],
      });
      
      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear animation state
      actions.setAnimationState({
        isAnimating: false,
        currentAnimation: null,
        animationQueue: [],
      });
    } catch (error) {
      console.error('Error animating phase transition:', error);
    }
  }, [actions]);
  
  // Effect to handle phase transitions
  useEffect(() => {
    const handlePhaseTransition = async () => {
      if (state.core.phase === 'setup' && state.core.lastAction === 'phase_change') {
        await animatePhaseTransition('setup', 'dealing');
      } else if (state.core.phase === 'dealing' && state.core.lastAction === 'phase_change') {
        await animatePhaseTransition('dealing', 'bidding');
      } else if (state.core.phase === 'bidding' && state.core.lastAction === 'phase_change') {
        await animatePhaseTransition('bidding', 'playing');
      } else if (state.core.phase === 'playing' && state.core.lastAction === 'phase_change') {
        await animatePhaseTransition('playing', 'scoring');
      } else if (state.core.phase === 'scoring' && state.core.lastAction === 'phase_change') {
        await animatePhaseTransition('scoring', 'finished');
      }
    };
    
    handlePhaseTransition();
  }, [state.core.phase, state.core.lastAction, animatePhaseTransition]);
  
  // Effect to handle game state validation
  useEffect(() => {
    const handleGameStateValidation = async () => {
      const errors = validateGameState();
      
      if (errors.length > 0) {
        // Set error state
        actions.setError(errors.join(', '));
        
        // Animate error state
        actions.setAnimationState({
          isAnimating: true,
          currentAnimation: 'error',
          animationQueue: errors,
        });
        
        // Clear error state after delay
        setTimeout(() => {
          actions.setError(null);
          actions.setAnimationState({
            isAnimating: false,
            currentAnimation: null,
            animationQueue: [],
          });
        }, 3000);
      }
    };
    
    handleGameStateValidation();
  }, [state, validateGameState, actions]);
  
  return {
    // Animation helpers
    animateCardPlay,
    animateTrickComplete,
    animateBidReveal,
    animatePhaseTransition,
  };
}; 