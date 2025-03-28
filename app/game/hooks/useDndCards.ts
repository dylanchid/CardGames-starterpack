import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { DroppedCardResult, DndCardItem } from '../types/dnd';
import { StackType, CardType } from '../types/card';
import { selectGameState } from '../store/slices/game/gameSelectors';

/**
 * Custom hook for handling card drag and drop with React DnD
 */
export function useDndCards() {
  const dispatch = useAppDispatch();
  const gameState = useAppSelector(selectGameState);

  // Handle card drop result
  const handleCardDrop = useCallback((result: DroppedCardResult) => {
    // Skip if source and target stacks are the same
    if (result.sourceStackId === result.targetStackId) {
      return;
    }

    // Dispatch your game action to move card here
    // Example: 
    // dispatch(moveCard({
    //   cardId: result.cardId,
    //   fromStack: result.sourceStackId,
    //   toStack: result.targetStackId,
    //   position: result.position || 0,
    // }));

    // For the card game, you might want to dispatch a play card action 
    // or other specific game action based on context
    console.log('Card dropped:', result);
  }, [dispatch]);

  // Validate if a card can be dropped on a specific stack
  const isValidCardDrop = useCallback((cardItem: DndCardItem, targetStack: StackType): boolean => {
    // Implement your game-specific logic here
    // For example:
    
    // 1. Can't drop on the same stack
    if (cardItem.sourceStackId === targetStack.id) {
      return false;
    }
    
    // 2. Can only drop on the table if the card is from a player's hand
    if (targetStack.type === 'table' && cardItem.sourceStackId.includes('hand')) {
      return true;
    }
    
    // 3. Game-specific rules
    // - Check if it's the current player's turn
    // - Check if the move follows game rules (e.g., card ranking, suits)
    // - Any other game logic
    
    // Default to true during development
    return true;
  }, [gameState]);

  // Get stack by ID utility
  const getStackById = useCallback((stackId: string): StackType | undefined => {
    if (!gameState) return undefined;
    
    // For now, this is a placeholder since we don't have stacks in the core game state yet
    // This will be replaced with actual implementation when the stacks are added to the state
    // This is just to prevent TypeScript errors
    return undefined;
    
    // When implemented, it will look something like:
    // return (gameState as any).stacks?.find((stack: StackType) => stack.id === stackId);
  }, [gameState]);

  return {
    handleCardDrop,
    isValidCardDrop,
    getStackById
  };
} 