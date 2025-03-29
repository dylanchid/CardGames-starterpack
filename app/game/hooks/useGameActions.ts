/**
 * @fileoverview Hook for handling game actions and state transitions
 */

import { useCallback } from 'react';
import { useGame } from '../components/core/GameProvider';
import { Player, Trick } from '@/app/types/core/GameTypes';
import { Bid } from '../types/core/GameTypes';
import { useDispatch } from 'react-redux';
import { addBid } from '../store/slices/game/gameSlice';

export const useGameActions = () => {
  const { state, actions, queries } = useGame();
  const dispatch = useDispatch();
  
  // Game setup actions
  const startGame = useCallback(async () => {
    try {
      actions.setPhase('playing');
    } catch (error) {
      console.error('Error starting game:', error);
      actions.setError('Failed to start game');
    }
  }, [actions]);
  
  // Bidding actions
  const placeBid = useCallback(async (playerId: string, value: number) => {
    try {
      const bid: Bid = {
        id: `bid-${Date.now()}`,
        playerId,
        cardIds: [], // Initialize with empty array
        timestamp: Date.now(),
        isRevealed: false,
        value: 0,
        roundNumber: state.core.roundNumber,
      };
      
      dispatch(addBid(bid));
      
      // Update player's bid
      const player = queries.getPlayer(playerId);
      if (player) {
        actions.updatePlayer({
          ...player,
          bids: [...player.bids, bid.id],
        });
      }
      
      // Move to next player
      const playerOrder = queries.getPlayerOrder();
      const currentIndex = playerOrder.findIndex(p => p.id === playerId);
      const nextIndex = (currentIndex + 1) % playerOrder.length;
      const nextPlayer = playerOrder[nextIndex];
      
      actions.setCurrentBidder(nextPlayer.id);
    } catch (error) {
      console.error('Error placing bid:', error);
      actions.setError('Failed to place bid');
    }
  }, [actions, queries, state.core.phase, dispatch]);
  
  const revealBid = useCallback(async (playerId: string) => {
    try {
      const player = queries.getPlayer(playerId);
      if (!player) return;
      
      const bid = player.bids
        .map(id => queries.getBid(id))
        .find(b => b && !b.isRevealed);
      
      if (bid) {
        actions.updateBid({
          ...bid,
          isRevealed: true,
        });
      }
    } catch (error) {
      console.error('Error revealing bid:', error);
      actions.setError('Failed to reveal bid');
    }
  }, [actions, queries]);
  
  // Card play actions
  const playCard = useCallback(async (cardId: string) => {
    try {
      const currentPlayer = queries.getCurrentPlayer();
      if (!currentPlayer) return;
      
      // Remove card from player's hand
      actions.updatePlayer({
        ...currentPlayer,
        hand: currentPlayer.hand.filter(id => id !== cardId),
      });
      
      // Add card to current trick
      const currentTrick = queries.getCurrentTrick();
      if (currentTrick) {
        actions.updateTrick({
          ...currentTrick,
          cards: [
            ...currentTrick.cards,
            {
              playerId: currentPlayer.id,
              cardId,
              timestamp: Date.now(),
            },
          ],
        });
      }
      
      // Move to next player
      const playerOrder = queries.getPlayerOrder();
      const currentIndex = playerOrder.findIndex(p => p.id === currentPlayer.id);
      const nextIndex = (currentIndex + 1) % playerOrder.length;
      const nextPlayer = playerOrder[nextIndex];
      
      actions.setCurrentPlayer(nextPlayer.id);
    } catch (error) {
      console.error('Error playing card:', error);
      actions.setError('Failed to play card');
    }
  }, [actions, queries]);
  
  const completeTrick = useCallback(async (winnerId: string) => {
    try {
      const currentTrick = queries.getCurrentTrick();
      if (!currentTrick) return;
      
      // Update trick with winner
      actions.updateTrick({
        ...currentTrick,
        winnerId,
      });
      
      // Update winner's tricks
      const winner = queries.getPlayer(winnerId);
      if (winner) {
        actions.updatePlayer({
          ...winner,
          tricks: [...winner.tricks, currentTrick.id],
        });
      }
      
      // Create new trick
      const newTrick: Trick = {
        id: `trick-${Date.now()}`,
        leaderId: winnerId,
        cards: [],
        winnerId: '',
        timestamp: Date.now(),
        roundNumber: currentTrick.roundNumber,
      };
      
      actions.addTrick(newTrick);
      actions.setCurrentTrick(newTrick.id);
      actions.setCurrentPlayer(winnerId);
    } catch (error) {
      console.error('Error completing trick:', error);
      actions.setError('Failed to complete trick');
    }
  }, [actions, queries]);
  
  // Round actions
  const startNewRound = useCallback(async () => {
    try {
      // Reset player hands and bids
      const players = queries.getPlayerOrder();
      players.forEach(player => {
        actions.updatePlayer({
          ...player,
          hand: [],
          bids: [],
          isReady: false,
        });
      });
      
      // Set phase to dealing
      actions.setPhase('dealing');
    } catch (error) {
      console.error('Error starting new round:', error);
      actions.setError('Failed to start new round');
    }
  }, [actions, queries]);
  
  // Game end actions
  const endGame = useCallback(async () => {
    try {
      // Calculate final scores
      const players = queries.getPlayerOrder();
      players.forEach(player => {
        const tricks = player.tricks.map(id => queries.getTrick(id)).filter((t): t is Trick => t !== undefined);
        const score = tricks.reduce((sum, trick) => sum + 1, 0);
        
        actions.updatePlayer({
          ...player,
          score,
        });
      });
      
      // Set phase to finished
      actions.setPhase('finished');
    } catch (error) {
      console.error('Error ending game:', error);
      actions.setError('Failed to end game');
    }
  }, [actions, queries]);
  
  return {
    startGame,
    placeBid,
    revealBid,
    playCard,
    completeTrick,
    startNewRound,
    endGame,
  };
}; 