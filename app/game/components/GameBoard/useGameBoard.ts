import { useCallback } from 'react';
import { CardType } from '../../types/card';
import { Trick } from '../../../types/core/GameTypes';
import { useGame } from '../core/GameProvider';

export function useGameBoard() {
  const { state, actions, queries } = useGame();

  // Helper function to validate if a card play is valid
  const isValidPlay = useCallback((card: CardType, currentTrick: Trick | null): boolean => {
    if (!currentTrick) return true; // First card in trick is always valid

    // Get the lead suit from the first card
    const firstCardId = currentTrick.cards[0]?.cardId;
    if (!firstCardId) return true; // No lead suit yet, any card is valid

    const firstCard = state.entities.cards[firstCardId];
    if (!firstCard) return true; // Invalid card, allow any play

    const leadSuit = firstCard.suit;

    // Check if player has any cards of the lead suit
    const currentPlayer = queries.getCurrentPlayer();
    if (!currentPlayer) return false;

    const hasLeadSuit = currentPlayer.hand.some((id: string) => {
      const handCard = state.entities.cards[id];
      return handCard?.suit === leadSuit;
    });

    // If player has lead suit, they must play it
    if (hasLeadSuit && card.suit !== leadSuit) {
      return false;
    }

    return true;
  }, [state, queries]);

  // Handle card play
  const handleCardPlay = useCallback((card: CardType) => {
    const currentPlayer = queries.getCurrentPlayer();
    if (!currentPlayer || !card) return;

    if (!queries.isPlayerTurn(currentPlayer.id)) {
      console.error('Not player\'s turn');
      return;
    }

    if (!currentPlayer.hand.includes(card.id)) {
      console.error('Card not in player\'s hand');
      return;
    }

    const currentTrick = queries.getCurrentTrick();
    if (!isValidPlay(card, currentTrick || null)) {
      console.error('Invalid play');
      return;
    }

    actions.playCard(card.id);
  }, [actions, queries, isValidPlay]);

  // Handle bid placement
  const handlePlaceBid = useCallback((cardIds: string[]) => {
    const currentPlayer = queries.getCurrentPlayer();
    if (!currentPlayer) return;

    if (!queries.isPlayerBidding(currentPlayer.id)) {
      console.error('Not player\'s turn to bid');
      return;
    }

    const bidCards = cardIds
      .map((id: string) => state.entities.cards[id])
      .filter((card: CardType | undefined): card is CardType => card !== undefined);

    if (bidCards.length !== cardIds.length) {
      console.error('Invalid bid cards');
      return;
    }

    // Calculate bid value based on suits
    const suitValues: Record<string, number> = {
      'CLUBS': 3,
      'HEARTS': 2,
      'SPADES': 1,
      'DIAMONDS': 0,
      'JOKER': 0
    };

    const value = bidCards.reduce((total, card) => {
      return total + suitValues[card.suit];
    }, 0);

    actions.addBid({
      id: `bid-${Date.now()}`,
      playerId: currentPlayer.id,
      cardIds,
      value,
      timestamp: Date.now(),
      roundNumber: Object.keys(state.entities.tricks).length || 0,
      isRevealed: false
    });
  }, [actions, queries, state]);

  // Handle bid reveal
  const handleRevealBid = useCallback(() => {
    const currentPlayer = queries.getCurrentPlayer();
    if (!currentPlayer) return;

    if (!queries.isPlayerBidding(currentPlayer.id)) {
      console.error('Not player\'s turn to reveal');
      return;
    }

    actions.revealBids();
  }, [actions, queries]);

  return {
    isValidPlay,
    handleCardPlay,
    handlePlaceBid,
    handleRevealBid,
    currentTrick: queries.getCurrentTrick(),
    currentPlayer: queries.getCurrentPlayer(),
    isPlayerTurn: queries.isPlayerTurn,
    isPlayerBidding: queries.isPlayerBidding,
    selectedCards: queries.getSelectedCards(),
    draggedCard: queries.getDraggedCard(),
    setSelectedCards: actions.setSelectedCards,
    setDraggedCard: actions.setDraggedCard
  };
} 