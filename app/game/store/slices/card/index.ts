/**
 * @fileoverview Card slice exports
 */

import cardReducer, {
  addCard,
  updateCard,
  removeCard,
  addStack,
  updateStack,
  removeStack,
  moveCard,
  flipCard,
  setCardLoading,
  setCardError,
  setStackLoading,
  setStackError,
  clearErrors,
  reset,
  setDraggingCard,
} from '../cardSlice';

import {
  selectStackById,
  selectDraggingCard,
  selectDragSource,
} from './cardSelectors';

export {
  // Reducer
  cardReducer as default,
  
  // Actions
  addCard,
  updateCard,
  removeCard,
  addStack,
  updateStack,
  removeStack,
  moveCard,
  flipCard,
  setCardLoading,
  setCardError,
  setStackLoading,
  setStackError,
  clearErrors,
  reset,
  setDraggingCard,
  
  // Selectors
  selectStackById,
  selectDraggingCard,
  selectDragSource,
}; 