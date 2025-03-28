import React, { CSSProperties } from 'react';
import { useDrop } from 'react-dnd';
import { Card } from '../Card/Card';
import { StackType, CardType } from '../../types/card';
import { ItemTypes, DndCardItem, DroppedCardResult } from '../../types/dnd';
import styles from './Stack.module.css';

interface StackProps {
  stack: StackType;
  onCardDrop: (result: DroppedCardResult) => void;
  isValidDrop?: (cardItem: DndCardItem, targetStack: StackType) => boolean;
  disabled?: boolean;
  onCardClick?: (card: CardType) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function Stack({
  stack,
  onCardDrop,
  isValidDrop,
  disabled = false,
  onCardClick,
  className = '',
  style = {}
}: StackProps) {
  // Setup React DnD drop
  const [{ isOver, canDrop }, dropRef] = useDrop(() => ({
    accept: ItemTypes.CARD,
    drop: (item: DndCardItem) => {
      onCardDrop({
        cardId: item.card.id,
        sourceStackId: item.sourceStackId,
        targetStackId: stack.id
      });
      return { stackId: stack.id };
    },
    canDrop: (item: DndCardItem) => {
      // If custom validation is provided, use it
      if (isValidDrop) {
        return isValidDrop(item, stack);
      }
      
      // Default validation: can't drop on the same stack
      return item.sourceStackId !== stack.id && !disabled;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }), [stack, onCardDrop, isValidDrop, disabled]);

  // Determine stack CSS classes
  const stackClasses = [
    styles.cardStack,
    styles[stack.type],
    isOver && canDrop && styles.validDrop,
    isOver && !canDrop && styles.invalidDrop,
    disabled && styles.disabled,
    className
  ].filter(Boolean).join(' ');

  // Calculate card positioning based on stack type
  const getCardStyle = (index: number, totalCards: number): CSSProperties => {
    if (stack.type === 'deck') {
      // For deck, stack cards with a minimal offset and ensure proper layering
      return {
        position: 'absolute',
        top: index * 0.2,
        left: 0,
        width: '100%',
        height: '100%',
        transform: 'none',
        zIndex: totalCards - index,
      } as CSSProperties;
    } else if (stack.type === 'hand') {
      // For hand, spread cards horizontally
      return {
        position: 'relative',
        transform: `translateX(${index * 30}px)`,
        zIndex: totalCards - index
      } as CSSProperties;
    } else {
      // For other stacks (like table)
      return {
        position: 'absolute',
        transform: `translate(-50%, -50%) translateY(${index * 2}px)`,
        top: '50%',
        left: '50%',
        zIndex: totalCards - index
      } as CSSProperties;
    }
  };

  return (
    <div 
      className={stackClasses}
      ref={dropRef}
      style={style}
      data-testid="card-stack"
      data-stack-type={stack.type}
    >
      {stack.cards.map((card, index) => (
        <Card
          key={card.id}
          card={card}
          onDragStart={() => {
            // Any additional logic before drag starts
          }}
          onDragEnd={() => {
            // Any additional logic after drag ends
          }}
          onClick={() => onCardClick?.(card)}
          style={getCardStyle(index, stack.cards.length)}
          disabled={disabled}
          id={card.id}
          stackId={stack.id}
        />
      ))}
    </div>
  );
} 