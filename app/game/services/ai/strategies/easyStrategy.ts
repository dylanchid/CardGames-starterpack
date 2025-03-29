/**
 * @fileoverview Easy AI strategy implementation
 */

import { CardGame, NinetyNineGameState, NinetyNinePlayer } from '../../../types/game';
import { CardType, Suit, Rank, getCardValue } from '../../../types/card';
import { Trick } from '../../../../types/core/GameTypes';

export const easyStrategy = {
  makeMove: (game: CardGame | null, state: NinetyNineGameState, playerId: string, performAction: (action: string, playerId: string, payload?: any) => void) => {
    const player = state.entities.players[playerId];
    if (!player) return;

    // Implement easy difficulty AI logic here
    // For now, just make a random valid move
    const availableActions = game?.actions.availableActions(state, playerId) || [];
    if (availableActions.length > 0) {
      const randomAction = availableActions[Math.floor(Math.random() * availableActions.length)];
      performAction(randomAction, playerId);
    }
  },

  calculateBid: (player: NinetyNinePlayer, state: any): number => {
    // Simple strategy: bid based on number of high cards
    const highCards = player.handIds.filter(cardId => {
      const card = state.entities.cards[cardId];
      if (!card) return false;
      return getCardValue(card) >= getCardValue({ 
        id: '', 
        suit: Suit.HEARTS, 
        rank: Rank.TEN, 
        isFaceUp: true, 
        position: { x: 0, y: 0, zIndex: 0 } 
      });
    });
    
    return Math.min(highCards.length + 1, 9);
  },

  calculateCardPlay: (player: NinetyNinePlayer, currentTrick: Trick, state: any, game: CardGame | null): string | null => {
    // Simple strategy: play random valid card
    const validCards = player.handIds.filter(cardId => {
      const card = state.entities.cards[cardId];
      if (!card) return false;
      return game?.rules.isValidPlay(state, cardId, player.id) || false;
    });

    if (validCards.length === 0) return null;
    return validCards[Math.floor(Math.random() * validCards.length)];
  },

  determineTrickWinner: (trick: Trick, state: any, game: CardGame | null): string | null => {
    // Simple strategy: use game rules to determine winner
    const firstCard = trick.cards[0]?.cardId;
    if (!firstCard) return null;
    const firstCardObj = state.entities.cards[firstCard];
    if (!firstCardObj) return null;

    // Map trick cards to CardType objects
    const trickCards = trick.cards.map(card => state.entities.cards[card.cardId]).filter((card): card is CardType => card !== undefined);
    return game?.rules.getTrickWinner?.(state, trickCards, firstCardObj.suit) || null;
  }
}; 