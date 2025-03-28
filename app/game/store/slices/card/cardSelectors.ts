/**
 * @fileoverview Selectors for the card slice
 */

import { RootState } from '../../store';
import { CardType } from '../../../types/card';

// Select a specific stack by ID
export const selectStackById = (state: RootState, stackId: string) => {
  return state.card.entities.stacks[stackId];
};

// Select the currently dragging card
export const selectDraggingCard = (state: RootState): CardType | null => {
  // This selector requires a draggingCardId field to be added to the state
  const dragId = state.card.draggingCardId;
  return dragId ? state.card.entities.cards[dragId] : null;
};

// Select the source stack of the dragging card
export const selectDragSource = (state: RootState): string | null => {
  // This selector requires a dragSourceId field to be added to the state
  return state.card.dragSourceId;
}; 