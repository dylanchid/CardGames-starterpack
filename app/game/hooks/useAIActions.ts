/**
 * @fileoverview Hook for handling AI player actions
 */

import { useCallback, useEffect } from 'react';
import { useGame } from '../components/core/GameProvider';
import { useGameActions } from './useGameActions';
import { NinetyNinePlayer } from '../types/game';
import { CardType, Rank, Suit, getCardValue } from '../types/card';
import { Trick } from '../../types/core/GameTypes';
import { adaptPlayerToNinetyNine } from '../types/core/TypeAdapters';

export const useAIActions = () => {
  const { state, actions, queries } = useGame();
  const { placeBid, revealBid, playCard, completeTrick } = useGameActions();
  
  // Helper function to get AI players
  const getAIPlayers = useCallback(() => {
    if (!state) return [];
    return Object.values(state.entities.players)
      .filter(player => player.isAI)
      .map(player => adaptPlayerToNinetyNine(player));
  }, [state]);
  
  // Helper function to get current AI player
  const getCurrentAIPlayer = useCallback(() => {
    if (!state) return null;
    const currentPlayer = state.entities.players[state.relationships.currentPlayer || ''];
    return currentPlayer?.isAI ? adaptPlayerToNinetyNine(currentPlayer) : null;
  }, [state]);
  
  // Helper function to get current AI bidder
  const getCurrentAIBidder = useCallback(() => {
    if (!state) return null;
    const currentBidder = state.entities.players[state.relationships.currentBidder || ''];
    return currentBidder?.isAI ? adaptPlayerToNinetyNine(currentBidder) : null;
  }, [state]);
  
  // AI bidding strategy
  const calculateAIBid = useCallback((player: NinetyNinePlayer) => {
    if (!state) return 0;
    // Simple strategy: bid based on number of high cards
    const highCards = player.handIds.filter(cardId => {
      const card = state.entities.cards[cardId];
      if (!card) return false;
      return getCardValue(card) >= getCardValue({ id: '', suit: Suit.HEARTS, rank: Rank.TEN, isFaceUp: true, position: { x: 0, y: 0, zIndex: 0 } });
    });
    
    return Math.min(highCards.length, 5); // Cap bid at 5
  }, [state]);
  
  // AI card play strategy
  const calculateAICardPlay = useCallback((player: NinetyNinePlayer, currentTrick: Trick) => {
    if (!state) return null;
    // Simple strategy: play highest card of leading suit if possible
    const leadingCardId = currentTrick.cards[0]?.cardId;
    if (!leadingCardId) return null;
    
    const leadingCard = state.entities.cards[leadingCardId];
    if (!leadingCard) return null;
    
    // Find highest card of leading suit
    const playableCards = player.handIds
      .map(id => state.entities.cards[id])
      .filter((card): card is CardType => 
        card !== undefined && card.suit === leadingCard.suit
      );
    
    if (playableCards.length === 0) {
      // No cards of leading suit, play highest card
      return player.handIds
        .map(id => state.entities.cards[id])
        .filter((card): card is CardType => card !== undefined)
        .sort((a: CardType, b: CardType) => getCardValue(b) - getCardValue(a))[0]?.id;
    }
    
    return playableCards.sort((a: CardType, b: CardType) => getCardValue(b) - getCardValue(a))[0]?.id;
  }, [state]);
  
  // AI trick winner determination
  const determineTrickWinner = useCallback((trick: Trick) => {
    if (!state) return null;
    // Simple strategy: highest card of leading suit wins
    const leadingCardId = trick.cards[0]?.cardId;
    if (!leadingCardId) return null;
    
    const leadingCard = state.entities.cards[leadingCardId];
    if (!leadingCard) return null;
    
    const cards = trick.cards
      .map(card => state.entities.cards[card.cardId])
      .filter((card): card is CardType => 
        card !== undefined && card.suit === leadingCard.suit
      );
    
    if (cards.length === 0) return null;
    
    const winningCard = cards.sort((a: CardType, b: CardType) => getCardValue(b) - getCardValue(a))[0];
    const winningCardId = trick.cards.find(card => 
      state.entities.cards[card.cardId]?.id === winningCard.id
    )?.cardId;
    
    return winningCardId || null;
  }, [state]);
  
  // Effect to handle AI bidding
  useEffect(() => {
    if (!state) return;
    const currentAIBidder = getCurrentAIBidder();
    if (!currentAIBidder) return;
    
    const handleAIBidding = async () => {
      try {
        // Calculate and place bid
        const bidValue = calculateAIBid(currentAIBidder);
        await placeBid(currentAIBidder.id, bidValue);
        
        // Reveal bid after a delay
        setTimeout(() => {
          revealBid(currentAIBidder.id);
        }, 1000);
      } catch (error) {
        console.error('Error handling AI bidding:', error);
      }
    };
    
    handleAIBidding();
  }, [state, getCurrentAIBidder, calculateAIBid, placeBid, revealBid]);
  
  // Effect to handle AI card play
  useEffect(() => {
    if (!state) return;
    const currentAIPlayer = getCurrentAIPlayer();
    if (!currentAIPlayer) return;
    
    const currentTrick = queries.getCurrentTrick();
    if (!currentTrick) return;
    
    const handleAICardPlay = async () => {
      try {
        // Calculate and play card
        const cardToPlay = calculateAICardPlay(currentAIPlayer, currentTrick);
        if (!cardToPlay) return;
        
        await playCard(cardToPlay);
        
        // If trick is complete, determine winner
        if (currentTrick.cards.length === state.relationships.playerOrder.length) {
          const winnerId = determineTrickWinner(currentTrick);
          if (winnerId) {
            await completeTrick(winnerId);
          }
        }
      } catch (error) {
        console.error('Error handling AI card play:', error);
      }
    };
    
    // Add delay to make AI actions feel more natural
    setTimeout(handleAICardPlay, 1000);
  }, [
    state,
    getCurrentAIPlayer,
    calculateAICardPlay,
    playCard,
    completeTrick,
    determineTrickWinner,
    queries,
  ]);
  
  return {
    getAIPlayers,
    getCurrentAIPlayer,
    getCurrentAIBidder,
    calculateAIBid,
    calculateAICardPlay,
    determineTrickWinner,
  };
}; 