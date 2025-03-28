/**
 * @fileoverview Selectors for card play state
 */

import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { CardType, Suit } from '@/app/game/types/card';
import { isValidPlay } from '@/app/game/utils/gameUtils';

// Basic selectors
export const selectCardPlayState = (state: RootState) => state.cardPlay;
export const selectDeckIds = (state: RootState) => state.cardPlay.deckIds;
export const selectCardsInPlay = (state: RootState) => state.cardPlay.cardsInPlay;
export const selectCurrentTrick = (state: RootState) => state.cardPlay.currentTrick;
export const selectTrickNumber = (state: RootState) => state.cardPlay.trickNumber;
export const selectPlayOrder = (state: RootState) => state.cardPlay.playOrder;
export const selectCardPlayCurrentPlayerIndex = (state: RootState) => state.cardPlay.currentPlayerIndex;

// Parameterized selectors
export const selectCardById = (state: RootState, cardId: string) => 
  state.cardPlay.cardsInPlay[cardId];

// Combined selectors
export const selectCurrentTrickCards = createSelector(
  [selectCurrentTrick, selectCardsInPlay],
  (currentTrick, cardsInPlay) => 
    currentTrick.cardIds.map(id => id ? cardsInPlay[id] : null)
);

export const selectDeckCards = createSelector(
  [selectDeckIds, selectCardsInPlay],
  (deckIds, cardsInPlay) => deckIds.map(id => cardsInPlay[id])
);

export const selectIsCurrentTrickComplete = createSelector(
  [selectCurrentTrick],
  currentTrick => currentTrick.complete
);

export const selectCurrentTrickLeadSuit = createSelector(
  [selectCurrentTrick],
  currentTrick => currentTrick.leadSuit
);

export const selectCurrentTrickWinnerIndex = createSelector(
  [selectCurrentTrick],
  currentTrick => currentTrick.winnerIndex
);

export const selectCurrentTrickWinnerPlayerId = createSelector(
  [selectCurrentTrickWinnerIndex, selectPlayOrder],
  (winnerIndex, playOrder) => winnerIndex !== null ? playOrder[winnerIndex] : null
);

export const selectCardPlayCurrentPlayerId = createSelector(
  [selectCardPlayCurrentPlayerIndex, selectPlayOrder],
  (currentPlayerIndex, playOrder) => playOrder[currentPlayerIndex]
);

export const selectValidCardsToPlay = createSelector(
  [(state: RootState, playerId: string) => {
    const player = state.player.entities[playerId];
    return player ? player.handIds.map(id => state.cardPlay.cardsInPlay[id]) : [];
  },
   selectCurrentTrickCards,
   selectCurrentTrickLeadSuit],
  (hand, currentTrickCards, leadSuit) => {
    // If this is the first card in the trick, any card is valid
    if (currentTrickCards.every(card => card === null)) {
      return hand;
    }
    
    // Otherwise, must follow suit if possible
    return hand.filter(card => 
      isValidPlay(card, currentTrickCards, hand, leadSuit as Suit)
    );
  }
);

export const selectCurrentPlayerValidCards = createSelector(
  [(state: RootState) => state,
   selectCardPlayCurrentPlayerId],
  (state, currentPlayerId) => 
    currentPlayerId ? selectValidCardsToPlay(state, currentPlayerId) : []
); 