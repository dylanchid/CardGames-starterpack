'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../core/GameProvider';
import { useGameBoard } from './GameBoardContext';
import { CardType, Suit, Rank, Position, StackType } from '../../types/card';
import { Card } from '../Card/Card';
import { PlayerHand } from '../PlayerHand/PlayerHand';
import { Stack } from '../Stack/Stack';
import { DragLayer } from '../DragLayer/DragLayer';
import { useDndCards } from '../../hooks/useDndCards';
import { DroppedCardResult, DndCardItem } from '../../types/dnd';
import { Player } from '../../types/core/PlayerTypes';
import { adaptPlayerToNinetyNine } from '../../types/core/TypeAdapters';
import { Player as PlayerComponent } from '../Player/Player';
import './GameBoard.css';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { Trick } from '../../types/core/GameTypes';

// Position type for card positioning
type CardPosition = Position;

// Card type for Player component
interface PlayerCardType {
  id: string;
  suit: Suit;
  rank: Rank;
  position: CardPosition;
  isFaceUp: boolean;
}

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
  handIds: z.array(z.string()),
  bidCardIds: z.array(z.string()),
  tricksWon: z.number(),
  score: z.number(),
  isActive: z.boolean(),
  isAI: z.boolean().optional(),
  rating: z.number().optional(),
  aiLevel: z.enum(['easy', 'medium', 'hard']).optional(),
  isReady: z.boolean(),
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

type GameBoardProps = Partial<z.infer<typeof GameBoardSchema>> & {
  className?: string;
};

// Helper function to transform player data for the Player component
const transformPlayerData = (player: Player, cards: Record<string, CardType>, onCardPlay: (card: PlayerCardType) => void) => {
  if (!player) {
    return {
      id: '',
      name: '',
      hand: [],
      bid: null,
      tricksWon: 0,
      isActive: false,
      onCardClick: () => {}
    };
  }

  const playerHand = player.handIds?.map((id: string) => ({
    ...cards[id],
    position: { x: 0, y: 0, zIndex: 1 } as Position,
    isFaceUp: true
  })) as PlayerCardType[] || [];

  return {
    id: player.id,
    name: player.name,
    hand: playerHand,
    bid: player.bidCardIds?.length > 0 ? player.bidCardIds.length : null,
    tricksWon: player.tricksWon,
    isActive: player.isActive,
    onCardClick: (card: { id: string; suit: Suit; rank: Rank; position: Position; isFaceUp?: boolean }) => {
      onCardPlay({
        id: card.id,
        suit: card.suit,
        rank: card.rank,
        position: card.position,
        isFaceUp: card.isFaceUp ?? true
      });
    }
  };
};

// Update the suit comparison to use the correct Suit enum
const isRedSuit = (suit: Suit) => suit === Suit.HEARTS || suit === Suit.DIAMONDS;

export const GameBoard: React.FC<GameBoardProps> = ({ 
  className,
  players = [],
  onCardPlay = () => {}
}) => {
  const { state, actions, queries } = useGame();
  const { state: boardState, actions: boardActions, queries: boardQueries } = useGameBoard();
  
  const [stacks, setStacks] = useState<StackType[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [draggedCard, setDraggedCard] = useState<CardType | null>(null);

  const currentTrick = boardQueries.getCurrentTrick();
  const currentPlayer = boardQueries.getCurrentPlayer();
  const playerOrder = boardQueries.getPlayerOrder();
  
  // Initialize React DnD hooks
  const { handleCardDrop, isValidCardDrop } = useDndCards();

  // Initialize stacks based on game state
  useEffect(() => {
    if (!state) return;

    // Convert game state to stacks
    const gameStacks: StackType[] = [];
    
    // Add deck stack if it exists in game state
    if (state.entities.stacks.deck) {
      const deckStack = state.entities.stacks.deck;
      const deckCards = deckStack.cardIds.map(id => state.entities.cards[id]);
      
      gameStacks.push({
        id: 'deck',
        cards: deckCards,
        position: { x: 100, y: 100, rotation: 0, zIndex: 1 },
        isFaceUp: false,
        type: 'deck',
        cardCount: deckCards.length
      });
    }
    
    // Add table stack for current trick
    if (currentTrick) {
      const trickCards = currentTrick.cards.map(card => state.entities.cards[card.cardId]);
      
      gameStacks.push({
        id: 'table',
        cards: trickCards,
        position: { x: 200, y: 200, rotation: 0, zIndex: 1 },
        isFaceUp: true,
        type: 'table',
        cardCount: trickCards.length
      });
    }
    
    // Add player hands
    if (state.entities.players) {
      playerOrder.forEach((player: Player, index: number) => {
        const handStack = state.entities.stacks[`hand-${player.id}`];
        if (handStack) {
          const handCards = handStack.cardIds.map(id => state.entities.cards[id]);
          
          // Position hands based on player index and game UI layout
          const position = getPlayerPosition(index, playerOrder.length);
          
          gameStacks.push({
            id: `hand-${player.id}`,
            cards: handCards,
            position: {
              x: position.x,
              y: position.y,
              rotation: 0,
              zIndex: 1
            },
            isFaceUp: true,
            type: 'hand',
            owner: player.id,
            cardCount: handCards.length
          });
        }
      });
    }
    
    setStacks(gameStacks);
  }, [state, currentTrick, playerOrder]);

  // Function to get player position based on game layout
  const getPlayerPosition = (index: number, totalPlayers: number): Position => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const radius = Math.min(window.innerWidth, window.innerHeight) * 0.4;
    
    const angle = (index * 2 * Math.PI) / totalPlayers;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      zIndex: 1,
      rotation: 0
    };
  };

  // Function to ensure position has required properties
  const ensurePosition = (position: Partial<Position>): Position => ({
    x: position.x || 0,
    y: position.y || 0,
    zIndex: position.zIndex || 1,
    rotation: position.rotation || 0
  });

  // Handle card click
  const handleCardClick = (card: CardType) => {
    const fromStack = stacks.find(s => s.cards.some(c => c.id === card.id));
    
    if (fromStack && fromStack.type === 'hand') {
      // Play card action
      actions.playCard(card.id);
    }
  };

  // Handle card drop
  const onCardDrop = (result: DroppedCardResult) => {
    const sourceStack = stacks.find(s => s.id === result.sourceStackId);
    const targetStack = stacks.find(s => s.id === result.targetStackId);
    
    if (!sourceStack || !targetStack) return;
    
    if (sourceStack.type === 'hand' && targetStack.type === 'table') {
      // Find the card being moved
      const card = sourceStack.cards.find(c => c.id === result.cardId);
      if (!card) return;
      
      // Play card action
      actions.playCard(card.id);
    }
  };

  // Validate card drop
  const validateCardDrop = useCallback((cardItem: DndCardItem, targetStack: StackType): boolean => {
    // Only allow card plays if it's the player's turn
    const sourceStack = stacks.find(s => s.id === cardItem.sourceStackId);
    if (!sourceStack?.owner) return false;
    
    const isPlayerTurn = queries.isPlayerTurn(sourceStack.owner);
    
    // Only allow card plays if it's a valid action
    if (targetStack.type === 'table' && cardItem.sourceStackId.includes('hand-')) {
      return isPlayerTurn;
    }
    
    return false;
  }, [queries.isPlayerTurn, stacks]);

  // Render loading state
  if (!state) {
    return <div className="loading">Loading game board...</div>;
  }

  // Render game board with React DnD
  return (
    <div 
      className={`game-board ${className || ''}`}
      style={{
        background: '#076324',
        position: 'relative',
        width: '100%',
        height: '600px',
        borderRadius: '1rem',
        overflow: 'hidden'
      }}
    >
      {/* Render stacks with React DnD */}
      {stacks.map(stack => {
        const stackWithPosition: StackType = {
          ...stack,
          position: ensurePosition(stack.position)
        };
        // Use PlayerHand component for hand stacks
        if (stack.type === 'hand') {
          const playerId = stack.owner || 'player1';
          const isCurrentPlayer = playerId === 'player1'; // Adjust based on your current player logic
          
          // Position the player hand at the bottom of the game board if it's the current player
          const position = isCurrentPlayer 
            ? { left: '50%', bottom: '20px', transform: 'translateX(-50%)' }
            : { 
                left: stack.position?.x || 0, 
                top: stack.position?.y || 0, 
                transform: 'none'
              };
              
          return (
            <div 
              key={stack.id}
              className={`player-hand-container ${isCurrentPlayer ? 'current-player' : ''}`}
              style={{
                position: 'absolute',
                ...position,
                zIndex: 1,
                width: isCurrentPlayer ? '80%' : '250px'
              }}
            >
              <Stack
                key={stack.id}
                stack={stackWithPosition}
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
            stack={stackWithPosition}
            onCardDrop={onCardDrop}
            isValidDrop={validateCardDrop}
            onCardClick={handleCardClick}
            className={`${stack.type}-stack`}
          />
        );
      })}

      {/* Center area for current trick */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="flex gap-2">
          {currentTrick?.cards.map((card, index) => {
            const cardData = state.entities.cards[card.cardId];
            if (!cardData) return null;
            
            return (
              <div
                key={`${cardData.suit}-${cardData.rank}-${index}`}
                className="w-24 h-36 bg-white rounded-lg shadow-lg flex items-center justify-center"
              >
                <span className={`text-2xl ${isRedSuit(cardData.suit) ? 'text-red-500' : 'text-black'}`}>
                  {cardData.rank} {cardData.suit}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Player positions */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
        <div className="bg-opacity-95 backdrop-blur-sm p-2 rounded-lg">
          <PlayerComponent {...transformPlayerData(boardState.players[0], state.entities.cards, onCardPlay)} />
        </div>
      </div>
      
      <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
        <div className="bg-opacity-95 backdrop-blur-sm p-2 rounded-lg">
          <PlayerComponent {...transformPlayerData(boardState.players[1], state.entities.cards, onCardPlay)} />
        </div>
      </div>
      
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="bg-opacity-95 backdrop-blur-sm p-2 rounded-lg">
          <PlayerComponent {...transformPlayerData(boardState.players[2], state.entities.cards, onCardPlay)} />
        </div>
      </div>
      
      <div className="absolute left-8 top-1/2 transform -translate-y-1/2">
        <div className="bg-opacity-95 backdrop-blur-sm p-2 rounded-lg">
          <PlayerComponent {...transformPlayerData(boardState.players[3], state.entities.cards, onCardPlay)} />
        </div>
      </div>
      
      {/* Custom drag layer for better UX */}
      <DragLayer />
    </div>
  );
};

export default GameBoard;