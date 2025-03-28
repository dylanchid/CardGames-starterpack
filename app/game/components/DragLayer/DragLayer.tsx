import React, { CSSProperties } from 'react';
import { useDragLayer } from 'react-dnd';
import { ItemTypes, DndCardItem } from '../../types/dnd';
import { Card } from '../Card/Card';
import styles from './DragLayer.module.css';

/**
 * DragLayer component for displaying custom drag previews
 * Especially useful for touch devices
 */
export function DragLayer() {
  const {
    itemType,
    isDragging,
    item,
    initialClientOffset,
    initialSourceClientOffset,
    clientOffset,
  } = useDragLayer((monitor) => ({
    itemType: monitor.getItemType(),
    isDragging: monitor.isDragging(),
    item: monitor.getItem() as DndCardItem,
    initialClientOffset: monitor.getInitialClientOffset(),
    initialSourceClientOffset: monitor.getInitialSourceClientOffset(),
    clientOffset: monitor.getClientOffset(),
  }));

  // Calculate the drag layer position
  const getLayerStyles = (): CSSProperties => {
    if (!clientOffset || !initialClientOffset || !initialSourceClientOffset) {
      return {
        display: 'none',
      };
    }

    const { x, y } = clientOffset;
    const dx = initialClientOffset.x - initialSourceClientOffset.x;
    const dy = initialClientOffset.y - initialSourceClientOffset.y;

    return {
      transform: `translate(${x - dx}px, ${y - dy}px)`,
    };
  };

  // Only render when dragging
  if (!isDragging || !item) {
    return null;
  }

  // Only render for card items
  if (itemType !== ItemTypes.CARD) {
    return null;
  }

  return (
    <div className={styles.dragLayer}>
      <div style={getLayerStyles()} className={styles.dragPreview}>
        {/* Render a card preview */}
        <Card 
          card={item.card}
          disabled={true}
          stackId={item.sourceStackId}
        />
      </div>
    </div>
  );
} 