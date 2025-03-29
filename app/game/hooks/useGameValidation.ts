/**
 * @fileoverview Hook for handling game validation and rules
 */

import { useCallback } from 'react';
import { useGame } from '../components/core/GameProvider';
import { Player, Trick, Bid } from '../../types/core/GameTypes';
import { CardType } from '../types/card';

export const useGameValidation = () => {
  const { state, queries } = useGame();
  
  // Validation helpers
  const isValidPlayerCount = useCallback(() => {
    const playerCount = queries.getPlayerOrder().length;
    return playerCount >= state.core.settings.minPlayers && 
           playerCount <= state.core.settings.maxPlayers;
  }, [queries, state.core.settings]);
  
  const isPlayerReady = useCallback((playerId: string) => {
    const player = queries.getPlayer(playerId);
    return player?.isReady ?? false;
  }, [queries]);
  
  const areAllPlayersReady = useCallback(() => {
    return queries.getPlayerOrder().every(player => player.isReady);
  }, [queries]);
  
  const isValidBid = useCallback((playerId: string, value: number) => {
    const player = queries.getPlayer(playerId);
    if (!player) return false;
    
    // Check if player has already bid
    const hasBid = player.bids.some(bidId => {
      const bid = queries.getBid(bidId);
      return bid && bid.roundNumber === (state.core.phase === 'bidding' ? 1 : 0);
    });
    
    if (hasBid) return false;
    
    // Check if bid is within valid range
    const maxBid = queries.getPlayerOrder().length;
    return value >= 0 && value <= maxBid;
  }, [queries, state.core.phase]);
  
  const isValidCardPlay = useCallback((playerId: string, cardId: string) => {
    const player = queries.getPlayer(playerId);
    if (!player) return false;
    
    // Check if it's player's turn
    if (state.relationships.currentPlayer !== playerId) return false;
    
    // Check if player has the card
    if (!player.hand.includes(cardId)) return false;
    
    // Check if player must follow suit
    const currentTrick = queries.getCurrentTrick();
    if (currentTrick && currentTrick.cards.length > 0) {
      const leadingCard = state.entities.cards[currentTrick.cards[0].cardId];
      const cardToPlay = state.entities.cards[cardId];
      
      if (!leadingCard || !cardToPlay) return false;
      
      // If player has cards of leading suit, they must play one
      const hasLeadingSuit = player.hand.some(id => {
        const card = state.entities.cards[id];
        return card && card.suit === leadingCard.suit;
      });
      
      if (hasLeadingSuit && cardToPlay.suit !== leadingCard.suit) {
        return false;
      }
    }
    
    return true;
  }, [queries, state.relationships.currentPlayer, state.entities.cards]);
  
  const isValidTrickWinner = useCallback((trick: Trick, winnerId: string) => {
    // Check if all players have played
    if (trick.cards.length !== queries.getPlayerOrder().length) return false;
    
    // Check if winner played in the trick
    const winnerPlayed = trick.cards.some(card => card.playerId === winnerId);
    if (!winnerPlayed) return false;
    
    // Check if winner has highest card of leading suit
    const leadingCard = state.entities.cards[trick.cards[0].cardId];
    if (!leadingCard) return false;
    
    const cards = trick.cards
      .map(c => state.entities.cards[c.cardId])
      .filter((card): card is CardType => 
        card !== undefined && card.suit === leadingCard.suit
      );
    
    if (cards.length === 0) return false;
    
    const rankValues: Record<string, number> = {
      'ACE': 14,
      'KING': 13,
      'QUEEN': 12,
      'JACK': 11,
      'TEN': 10,
      'NINE': 9,
      'EIGHT': 8,
      'SEVEN': 7,
      'SIX': 6,
      'FIVE': 5,
      'FOUR': 4,
      'THREE': 3,
      'TWO': 2,
    };
    
    const winningCard = cards.sort((a, b) => rankValues[b.rank] - rankValues[a.rank])[0];
    const winningPlay = trick.cards.find(c => 
      state.entities.cards[c.cardId]?.id === winningCard.id
    );
    
    return winningPlay?.playerId === winnerId;
  }, [queries, state.entities.cards]);
  
  // Game state validation
  const validateGameState = useCallback(() => {
    const errors: string[] = [];
    
    // Validate player count
    if (!isValidPlayerCount()) {
      errors.push(`Invalid player count. Must be between ${state.core.settings.minPlayers} and ${state.core.settings.maxPlayers}`);
    }
    
    // Validate player readiness
    if (!areAllPlayersReady()) {
      errors.push('Not all players are ready');
    }
    
    // Validate current phase
    if (state.core.phase === 'bidding' && state.relationships.currentBidder === null) {
      errors.push('No current bidder set');
    }
    
    if (state.core.phase === 'playing' && state.relationships.currentPlayer === null) {
      errors.push('No current player set');
    }
    
    // Validate current trick
    if (state.core.phase === 'playing' && state.relationships.currentTrick === null) {
      errors.push('No current trick set');
    }
    
    return errors;
  }, [
    state.core.phase,
    state.core.settings,
    state.relationships.currentBidder,
    state.relationships.currentPlayer,
    state.relationships.currentTrick,
    isValidPlayerCount,
    areAllPlayersReady,
  ]);
  
  // Action validation
  const validateAction = useCallback((action: string, payload: any) => {
    switch (action) {
      case 'placeBid':
        if (!isValidBid(payload.playerId, payload.value)) {
          return 'Invalid bid';
        }
        break;
        
      case 'playCard':
        if (!isValidCardPlay(payload.playerId, payload.cardId)) {
          return 'Invalid card play';
        }
        break;
        
      case 'completeTrick':
        const currentTrick = queries.getCurrentTrick();
        if (!currentTrick || !isValidTrickWinner(currentTrick, payload.winnerId)) {
          return 'Invalid trick winner';
        }
        break;
    }
    
    return null;
  }, [isValidBid, isValidCardPlay, isValidTrickWinner, queries]);
  
  return {
    // Validation helpers
    isValidPlayerCount,
    isPlayerReady,
    areAllPlayersReady,
    isValidBid,
    isValidCardPlay,
    isValidTrickWinner,
    
    // Game state validation
    validateGameState,
    
    // Action validation
    validateAction,
  };
}; 