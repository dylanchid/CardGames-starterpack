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

  const value = {
    currentGame: {
      playerIds: game.playerIds,
      entities: {
        players: game.entities.players,
        cards: game.entities.cards,
      },
      currentTrick: game.currentTrick.map(card => ({
        suit: card.suit,
        rank: card.rank,
        player: game.currentTrickLeader,
      })),
      ui: {
        layout: 'circular',
        themes: {
          default: {
            tableColor: '#076324',
          },
        },
        cardArrangement: 'fan',
      },
      onCardPlay: (card: CardType) => {
        // Implementation of onCardPlay
      },
    },
    gameState: {
      deckIds: game.deckIds,
      currentTrickCardIds: game.currentTrickCardIds,
      entities: game.entities,
      playerIds: game.playerIds,
    },
    isLoading: game.isLoading,
    performAction: (action: string, playerId: string, data: any) => {
      switch (action) {
        case 'PLAY_CARD':
          game.playCard(data.cardId, data.playerId);
          break;
        // Add other actions as needed
      }
    },
    getAvailableActions: (playerId: string) => {
      const actions = [];
      if (game.currentPlayerIndex === game.playerIds.indexOf(playerId)) {
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