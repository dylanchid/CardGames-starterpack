import { CardType } from '../../game/types/card';

export interface StackType {
  id: string;
  type: 'hand' | 'trick' | 'deck' | 'discard' | 'table';
  cardIds: string[];
  ownerId?: string;
  position?: {
    x: number;
    y: number;
    rotation: number;
  };
  cards: CardType[];
  isFaceUp: boolean;
  cardCount: number;
  topCard?: CardType;
  bottomCard?: CardType;
  isEmpty?: boolean;
  isFull?: boolean;
  hasFaceUpCards?: boolean;
  hasFaceDownCards?: boolean;
  isLoading?: boolean;
  error?: string;
} 