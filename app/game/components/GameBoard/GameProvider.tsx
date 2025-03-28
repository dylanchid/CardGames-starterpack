import React, { createContext, useContext } from 'react';
import { useGame } from '../../hooks/useGame';
import { CardType } from '../../types/card';

interface GameContextType {
  currentGame: {
    playerIds: string[];
    entities: {
      players: Record<string, any>;
      cards: Record<string, any>;
    };
    currentTrick: Array<{
      suit: string;
      rank: string;
      player: number;
    }>;
    ui: {
      layout: string;
      themes: {
        default: {
          tableColor: string;
        };
      };
      cardArrangement: 'fan' | 'stack' | 'row';
    };
    onCardPlay?: (card: CardType) => void;
  };
  gameState: {
    deckIds: string[];
    currentTrickCardIds: (string | null)[];
    entities: {
      cards: Record<string, any>;
      players: Record<string, any>;
    };
    playerIds: string[];
  };
  isLoading: boolean;
  performAction: (action: string, playerId: string, data: any) => void;
  getAvailableActions: (playerId: string) => string[];
}

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const game = useGame();

  // Map the game state from useGame() to the format expected by the GameContext
  const value = {
    currentGame: {
      playerIds: game.players.map(p => p.id),
      entities: {
        players: game.players.reduce((acc, player) => {
          acc[player.id] = player;
          return acc;
        }, {} as Record<string, any>),
        cards: {},  // This needs to be populated based on your game structure
      },
      currentTrick: game.currentTrick.map(card => ({
        suit: card ? card.suit : '',
        rank: card ? card.rank : '',
        player: game.currentTrickLeader,
      })),
      ui: {
        layout: 'circular',
        themes: {
          default: {
            tableColor: '#076324',
          },
        },        cardArrangement: 'fan' as const,
      },
      onCardPlay: (card: CardType) => {
        // Implementation of onCardPlay using game.playCard
        if (game.canPlayCard && card) {
          game.playCard(game.currentPlayer?.id || '', card);
        }
      },
    },
    gameState: {
      deckIds: game.deck.map(card => card.id),
      currentTrickCardIds: game.currentTrick.map(card => card ? card.id : null),
      entities: {
        cards: game.deck.reduce((acc, card) => {
          acc[card.id] = card;
          return acc;
        }, {} as Record<string, any>),
        players: game.players.reduce((acc, player) => {
          acc[player.id] = player;
          return acc;
        }, {} as Record<string, any>),
      },
      playerIds: game.players.map(p => p.id),
    },
    isLoading: game.isLoading,
    performAction: (action: string, playerId: string, data: any) => {
      switch (action) {
        case 'PLAY_CARD':
          if (data.cardId && data.playerId) {
            const card = game.deck.find(c => c.id === data.cardId);
            if (card) {
              game.playCard(data.playerId, card);
            }
          }
          break;
        // Add other actions as needed
      }
    },
    getAvailableActions: (playerId: string) => {
      const actions = [];
      const playerIndex = game.players.findIndex(p => p.id === playerId);
      if (game.currentPlayerIndex === playerIndex) {
        actions.push('PLAY_CARD');
      }
      return actions;
    },
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}; 