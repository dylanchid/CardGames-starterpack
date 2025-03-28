import { CardType, StackType } from './card';

/**
 * DnD card item type - represents a card being dragged
 */
export interface DndCardItem {
  type: 'card';
  card: CardType;
  sourceStackId: string;
}

/**
 * DnD stack item type - represents where a card can be dropped
 */
export interface DndStackItem {
  type: 'stack';
  stack: StackType;
}

/**
 * Common item types for the drag and drop system
 */
export const ItemTypes = {
  CARD: 'card',
  STACK: 'stack',
} as const;

/**
 * DroppedCardResult - result of a card being dropped on a target
 */
export interface DroppedCardResult {
  cardId: string;
  sourceStackId: string;
  targetStackId: string;
  position?: number;
}

/**
 * Drag layer types - used for providing custom drag previews
 */
export interface DragLayerState {
  itemType: string | null;
  isDragging: boolean;
  item: DndCardItem | null;
  initialClientOffset: { x: number; y: number } | null;
  initialSourceClientOffset: { x: number; y: number } | null;
  clientOffset: { x: number; y: number } | null;
  differenceFromInitialOffset: { x: number; y: number } | null;
} 