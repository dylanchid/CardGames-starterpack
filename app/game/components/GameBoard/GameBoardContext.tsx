'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { CardType } from '../../types/card';
import { Trick, GameState } from '../../../types/core/GameTypes';
import { Player } from '../../types/core/PlayerTypes';
import { adaptPlayerToNinetyNine } from '../../types/core/TypeAdapters';
import { useGame } from '../core/GameProvider';

interface GameBoardContextType {
  state: {
    players: Player[];
    currentTrick: Trick | null;
    entities: GameState['entities'];
  };
  actions: {
    playCard: (cardId: string, playerId: string) => void;
    addTrick: (trick: Trick) => void;
    updateTrick: (trick: Trick) => void;
  };
  queries: {
    getCurrentPlayer: () => Player | null;
    getPlayer: (id: string) => Player | null;
    getCard: (id: string) => CardType | undefined;
    getCurrentTrick: () => Trick | null;
    getPlayerOrder: () => Player[];
  };
}

const GameBoardContext = createContext<GameBoardContextType | undefined>(undefined);

export function useGameBoard() {
  const context = useContext(GameBoardContext);
  if (context === undefined) {
    throw new Error('useGameBoard must be used within a GameBoardProvider');
  }
  return context;
}

interface GameBoardProviderProps {
  children: ReactNode;
}

export function GameBoardProvider({ children }: GameBoardProviderProps) {
  const game = useGame();

  const value = {
    state: {
      players: Object.values(game.state.entities.players).map(adaptPlayerToNinetyNine),
      currentTrick: game.state.relationships.currentTrick 
        ? game.state.entities.tricks[game.state.relationships.currentTrick] 
        : null,
      entities: game.state.entities,
    },
    actions: {
      playCard: game.actions.playCard,
      addTrick: game.actions.addTrick,
      updateTrick: game.actions.updateTrick,
    },
    queries: {
      getCurrentPlayer: () => game.state.relationships.currentPlayer 
        ? adaptPlayerToNinetyNine(game.state.entities.players[game.state.relationships.currentPlayer])
        : null,
      getPlayer: (id: string) => game.state.entities.players[id] 
        ? adaptPlayerToNinetyNine(game.state.entities.players[id])
        : null,
      getCard: (id: string) => game.state.entities.cards[id],
      getCurrentTrick: () => game.state.relationships.currentTrick 
        ? game.state.entities.tricks[game.state.relationships.currentTrick] 
        : null,
      getPlayerOrder: () => Object.values(game.state.entities.players).map(adaptPlayerToNinetyNine),
    },
  };

  return (
    <GameBoardContext.Provider value={value}>
      {children}
    </GameBoardContext.Provider>
  );
} 