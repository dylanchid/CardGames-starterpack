import { CardType, Position } from '../card';

export interface StackType {
  id: string;
  cards: CardType[];
  cardIds: string[];
  position: Position;
  isFaceUp: boolean;
  type: 'deck' | 'hand' | 'table' | 'discard';
  ownerId?: string;
  cardCount: number;
} 