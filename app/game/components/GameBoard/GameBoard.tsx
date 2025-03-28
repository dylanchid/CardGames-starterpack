'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useGameContext } from './GameProvider';
import { StackType, Position, CardType } from '../../types/card';
import { Card } from '../Card/Card';
import { PlayerHand } from '../PlayerHand/PlayerHand';
import { Stack } from '../Stack/Stack';
import { DragLayer } from '../DragLayer/DragLayer';
import { useDndCards } from '../../hooks/useDndCards';
import { DroppedCardResult, DndCardItem } from '../../types/dnd';
import './GameBoard.css';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { Player } from '../Player/Player';

const CardSchema = z.object({
  id: z.string(),
  suit: z.string(),
  rank: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
    zIndex: z.number(),
  }),
});

const PlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  hand: z.array(CardSchema),
  bid: z.number().nullable(),
  tricksWon: z.number(),
  isActive: z.boolean(),
});

const GameBoardSchema = z.object({
  players: z.array(PlayerSchema),
  currentTrick: z.array(z.object({
    suit: z.string(),
    rank: z.string(),
    player: z.number(),
  })),
  onCardPlay: z.function().args(CardSchema).returns(z.void()),
});

type GameBoardProps = z.infer<typeof GameBoardSchema> & {
  className?: string;
};

export const GameBoard: React.FC<GameBoardProps> = ({ className }) => {
  const { 
    currentGame, 
    gameState, 
    isLoading, 
    performAction,
    getAvailableActions
  } = useGameContext();
  
  const [stacks, setStacks] = useState<StackType[]>([]);
  
  // Initialize React DnD hooks
  const { handleCardDrop, isValidCardDrop } = useDndCards();

  // Initialize stacks based on game state
  useEffect(() => {
    if (!gameState || !currentGame) return;

    // Convert game state to stacks
    const gameStacks: StackType[] = [];
    
    // Add deck stack if it exists in game state
    if (gameState.deckIds && gameState.deckIds.length > 0) {
      const deckCards = gameState.deckIds.map((id: string) => gameState.entities.cards[id]);
      
      gameStacks.push({
        id: 'deck',
        cards: deckCards,
        position: { x: 50, y: 50, zIndex: 1 },
        isFaceUp: false,
        type: 'deck',
        cardCount: deckCards.length
      });
    }
    
    // Add table stack
    gameStacks.push({
      id: 'table',
      cards: gameState.currentTrickCardIds 
        ? gameState.currentTrickCardIds
            .filter((id: string | null) => id !== null)
            .map((id: string) => gameState.entities.cards[id])
        : [],
      position: { x: 200, y: 200, zIndex: 1 },
      isFaceUp: true,
      type: 'table',
      cardCount: gameState.currentTrickCardIds?.filter((id: string | null) => id !== null).length || 0
    });
    
    // Add player hands
    if (gameState.entities.players) {
      gameState.playerIds.forEach((playerId: string, index: number) => {
        const player = gameState.entities.players[playerId];
        const handCards = player.handIds.map((id: string) => gameState.entities.cards[id]);
        
        // Position hands based on player index and game UI layout
        const position = getPlayerPosition(index, gameState.playerIds.length, currentGame.ui.layout);
        
        gameStacks.push({
          id: `player-${playerId}`,
          cards: handCards,
          position,
          isFaceUp: true,
          type: 'hand',
          cardCount: handCards.length,
          owner: playerId
        });
      });
    }
    
    setStacks(gameStacks);
  }, [gameState, currentGame]);

  // Function to get player position based on game layout
  const getPlayerPosition = (playerIndex: number, totalPlayers: number, layout: string) => {
    const baseX = 400;
    const baseY = 400;
    const radius = 300;
    
    // For circular layout, position players in a circle
    if (layout === 'circular') {
      const angle = (playerIndex * 2 * Math.PI / totalPlayers) - Math.PI/2;
      return {
        x: baseX + radius * Math.cos(angle),
        y: baseY + radius * Math.sin(angle),
        zIndex: 1
      };
    }
    
    // For rectangular layout, position players on the sides
    if (layout === 'rectangle') {
      const positions = [
        { x: baseX, y: baseY + radius }, // bottom
        { x: baseX - radius, y: baseY }, // left
        { x: baseX, y: baseY - radius }, // top
        { x: baseX + radius, y: baseY }, // right
      ];
      
      // If more than 4 players, adjust positions
      const posIndex = playerIndex % positions.length;
      return {
        ...positions[posIndex],
        zIndex: 1
      };
    }
    
    // Default stacked layout
    return {
      x: baseX,
      y: baseY + (playerIndex * 50),
      zIndex: 1
    };
  };

  // Handle card click
  const handleCardClick = (card: CardType) => {
    const fromStack = stacks.find(s => s.cards.some(c => c.id === card.id));
    
    if (fromStack && fromStack.type === 'hand') {
      // Handle card play via click
      performAction('PLAY_CARD', fromStack.owner || 'player1', {
        cardId: card.id,
        playerId: fromStack.owner
      });
    }
  };

  // Custom card drop handler using React DnD
  const onCardDrop = (result: DroppedCardResult) => {
    // Find the source and target stacks
    const sourceStack = stacks.find(s => s.id === result.sourceStackId);
    const targetStack = stacks.find(s => s.id === result.targetStackId);
    
    if (!sourceStack || !targetStack) return;
    
    // Check if this is a player hand to table move (playing a card)
    if (sourceStack.type === 'hand' && targetStack.type === 'table') {
      // Find the card being moved
      const card = sourceStack.cards.find(c => c.id === result.cardId);
      if (!card) return;
      
      // Play card action
      performAction('PLAY_CARD', sourceStack.owner || 'player1', {
        cardId: card.id,
        playerId: sourceStack.owner
      });
    }
    
    // Call the main handler for any Redux actions
    handleCardDrop(result);
  };

  // Validate if a drop is valid with game-specific rules
  const validateCardDrop = useCallback((cardItem: DndCardItem, targetStack: StackType): boolean => {
    // Implement game-specific validation logic
    const availableActions = getAvailableActions('player1'); // Replace with current player ID
    
    // Only allow card plays if it's a valid action
    if (targetStack.type === 'table' && cardItem.sourceStackId.includes('player-')) {
      return availableActions.includes('PLAY_CARD');
    }
    
    return false;
  }, [getAvailableActions]);

  // Render loading state
  if (isLoading) {
    return <div className="loading">Loading game board...</div>;
  }

  // Render game board with React DnD
  return (
    <div 
      className={`game-board ${className || ''}`}
      style={{
        background: currentGame?.ui.themes?.default.tableColor || '#076324',
        position: 'relative',
        width: '100%',
        height: '600px',
        borderRadius: '1rem',
        overflow: 'hidden'
      }}
    >
      {/* Render stacks with React DnD */}
      {stacks.map(stack => {
        // Use PlayerHand component for hand stacks
        if (stack.type === 'hand') {
          const playerId = stack.owner || 'player1';
          const isCurrentPlayer = playerId === 'player1'; // Adjust based on your current player logic
          
          // Position the player hand at the bottom of the game board if it's the current player
          const position = isCurrentPlayer 
            ? { left: '50%', bottom: '20px', transform: 'translateX(-50%)' }
            : { 
                left: stack.position.x, 
                top: stack.position.y, 
                transform: 'none'
              };
              
          return (
            <div 
              key={stack.id}
              className={`player-hand-container ${isCurrentPlayer ? 'current-player' : ''}`}
              style={{
                position: 'absolute',
                ...position,
                zIndex: stack.position.zIndex,
                width: isCurrentPlayer ? '80%' : '250px'
              }}
            >
              <Stack
                key={stack.id}
                stack={stack}
                onCardDrop={onCardDrop}
                isValidDrop={validateCardDrop}
                onCardClick={handleCardClick}
                className="hand-stack"
              />
            </div>
          );
        }
        
        // For non-hand stacks (deck, table, etc.)
        return (
          <Stack
            key={stack.id}
            stack={stack}
            onCardDrop={onCardDrop}
            isValidDrop={validateCardDrop}
            onCardClick={handleCardClick}
            className={`${stack.type}-stack`}
            style={{
              position: 'absolute',
              left: stack.position.x,
              top: stack.position.y,
              zIndex: stack.position.zIndex
            }}
          />
        );
      })}

      {/* Center area for current trick */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="flex gap-2">
          {currentGame?.currentTrick.map((card, index) => (
            <div
              key={`${card.suit}-${card.rank}-${index}`}
              className="w-24 h-36 bg-white rounded-lg shadow-lg flex items-center justify-center"
            >
              <span className={`text-2xl ${card.suit === '♥' || card.suit === '♦' ? 'text-red-500' : 'text-black'}`}>
                {card.rank} {card.suit}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Player positions */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <Player {...currentGame?.entities.players[currentGame.playerIds[0]]} onCardClick={currentGame?.onCardPlay} />
      </div>
      
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
        <Player {...currentGame?.entities.players[currentGame.playerIds[1]]} onCardClick={currentGame?.onCardPlay} />
      </div>
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <Player {...currentGame?.entities.players[currentGame.playerIds[2]]} onCardClick={currentGame?.onCardPlay} />
      </div>
      
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
        <Player {...currentGame?.entities.players[currentGame.playerIds[3]]} onCardClick={currentGame?.onCardPlay} />
      </div>
      
      {/* Custom drag layer for better UX */}
      <DragLayer />
    </div>
  );
};

// Helper functions for card display
function getRankDisplay(rank: string): string {
  const display: Record<string, string> = {
    'ACE': 'A',
    'KING': 'K',
    'QUEEN': 'Q',
    'JACK': 'J',
    'TEN': '10',
    'NINE': '9',
    'EIGHT': '8',
    'SEVEN': '7',
    'SIX': '6',
    'FIVE': '5',
    'FOUR': '4',
    'THREE': '3',
    'TWO': '2',
  };
  return display[rank] || rank;
}

function getSuitSymbol(suit: string): string {
  const symbols: Record<string, string> = {
    'HEARTS': '♥',
    'DIAMONDS': '♦',
    'CLUBS': '♣',
    'SPADES': '♠',
  };
  return symbols[suit] || suit;
}

export default GameBoard;
