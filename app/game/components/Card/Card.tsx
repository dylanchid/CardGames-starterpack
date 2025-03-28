import React, { useCallback, memo } from 'react';
import { useDrag } from 'react-dnd';
import { Suit, Rank, CardProps, CardType, CARD_PATTERNS } from '../../types/card';
import { CardFace } from './CardFace';
import { CardBack } from './CardBack';
import { useCardStyles } from './useCardStyles';
import styles from './Card.module.css';
import { ItemTypes, DndCardItem } from '../../types/dnd';

// Add this near the top of your component
const debugCard = process.env.NODE_ENV === 'development';

/**
 * Enhanced Card component with improved error handling and Joker support
 * Now uses React DnD for drag and drop functionality
 */
export const Card = memo<CardProps>(({
  card,
  onClick,
  onDragStart: propDragStart,
  onDragEnd: propDragEnd,
  disabled = false,
  selected = false,
  index = 0,
  style,
  id,
  backPattern = CARD_PATTERNS.DEFAULT,
  backPrimaryColor,
  backSecondaryColor,
  isLoading = false,
  error,
  stackId
}) => {
  // Enhanced debugging for development
  if (debugCard) {
    console.debug('[Card] Rendering card:', { 
      id: card?.id, 
      rank: card?.rank, 
      suit: card?.suit, 
      isFaceUp: card?.isFaceUp
    });
  }

  // Type validation with detailed logging
  if (!card) {
    console.error('[Card] Missing card data');
    return (
      <div 
        className={`${styles.playingCard} ${styles.error}`} 
        role="alert"
        data-testid="card-error-missing"
        data-card-class="playing-card error"
      >
        Missing card data
      </div>
    );
  }

  // Check if card suit is valid
  const isValidSuit = Object.values(Suit).includes(card.suit as Suit);
  // Check if card rank is valid 
  const isValidRank = Object.values(Rank).includes(card.rank as Rank);
  
  if (!isValidSuit || !isValidRank) {
    console.error('[Card] Invalid card data:', { 
      rank: card.rank, 
      suit: card.suit,
      validRank: isValidRank,
      validSuit: isValidSuit,
      id: card.id
    });
    
    return (
      <div 
        className={`${styles.playingCard} ${styles.error}`} 
        role="alert"
        data-testid={`card-error-${card.id || 'unknown'}`}
        data-card-class="playing-card error"
      >
        <div className={styles.errorMessage}>
          Invalid card: {card.rank} of {card.suit}
        </div>
      </div>
    );
  }

  // Setup React DnD drag
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: ItemTypes.CARD,
    item: (): DndCardItem => {
      if (propDragStart) propDragStart();
      return {
        type: 'card',
        card,
        sourceStackId: stackId || 'unknown'
      };
    },
    canDrag: !disabled,
    end: () => {
      if (propDragEnd) propDragEnd();
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [card, disabled, stackId, propDragStart, propDragEnd]);

  const handleClick = useCallback(() => {
    if (!disabled && onClick) {
      onClick();
    }
  }, [disabled, onClick]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        handleClick();
      }
    },
    [disabled, handleClick]
  );

  const { cardClasses, cardStyle } = useCardStyles(card, selected, index, style, disabled);

  // Apply color class based on suit
  const isJoker = card.rank === Rank.JOKER;
  const colorClass = isJoker 
    ? styles.red 
    : (card.suit === Suit.HEARTS || card.suit === Suit.DIAMONDS) 
      ? styles.red 
      : styles.black;
  
  // Add dragging class when card is being dragged
  const finalCardClasses = `${cardClasses} ${colorClass} ${isDragging ? styles.dragging : ''}`;

  // Build data attributes for testing
  const dataClasses = [];
  if (cardClasses.includes('playingCard')) dataClasses.push('playing-card');
  if (cardClasses.includes('selected')) dataClasses.push('selected');
  if (cardClasses.includes('disabled')) dataClasses.push('disabled');
  if (cardClasses.includes('faceDown')) dataClasses.push('face-down');
  if (cardClasses.includes('error')) dataClasses.push('error');
  if (colorClass.includes('red')) dataClasses.push('red');
  if (colorClass.includes('black')) dataClasses.push('black');
  if (isDragging) dataClasses.push('dragging');

  // Special aria label for Joker cards
  const ariaLabel = !card.isFaceUp 
    ? 'Face down card' 
    : isJoker 
      ? 'Joker card' 
      : `${card.rank.toLowerCase()} of ${card.suit.toLowerCase()}`;

  const cardContent = !card.isFaceUp ? (
    <CardBack 
      backPattern={backPattern}
      backPrimaryColor={backPrimaryColor}
      backSecondaryColor={backSecondaryColor}
    />
  ) : error || card.error ? (
    <div className={styles.errorMessage} role="alert">
      {error || card.error || 'Failed to load card'}
    </div>
  ) : (
    <CardFace 
      isLoading={isLoading}
      card={card}
    />
  );

  return (
    <div
      className={finalCardClasses}
      onClick={handleClick}
      ref={(node: HTMLDivElement | null) => {
        // Apply the drag ref
        dragRef(node);
      }}
      style={{
        ...cardStyle,
        opacity: isDragging ? 0.5 : 1
      }}
      role="button"
      aria-label={ariaLabel}
      aria-disabled={disabled}
      aria-pressed={selected}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKeyDown}
      id={id}
      data-testid={`card-${card.id}`}
      data-card-class={dataClasses.join(' ')}
    >
      <div className={styles.cardInner}>
        {cardContent}
      </div>
    </div>
  );
});

Card.displayName = 'Card'; 