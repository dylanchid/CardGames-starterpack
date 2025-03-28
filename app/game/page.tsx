'use client';

import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { GameBoard } from './components/GameBoard/GameBoard';
import { GameControls } from './components/GameControls/GameControls';
import { useGame } from './hooks/useGame';
import DndProvider from './components/DndProvider';
import { z } from 'zod';
import { CardType, Suit, Rank, SUIT_SYMBOLS, RANK_DISPLAY } from './types/card';

// Define the expected Player type for GameBoard
const PlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  hand: z.array(z.object({
    id: z.string(),
    suit: z.string(),
    rank: z.string(),
    position: z.object({
      x: z.number(),
      y: z.number(),
      zIndex: z.number(),
    }),
  })),
  bid: z.number().nullable(),
  tricksWon: z.number(),
  isActive: z.boolean(),
});

type GameBoardPlayer = z.infer<typeof PlayerSchema>;

// Interface for the expected currentTrick format by GameBoard
interface GameBoardTrickCard {
  player: number;
  suit: string;
  rank: string;
}

// Adapter function to transform CardType to GameBoardTrickCard
const adaptCurrentTrick = (currentTrick: (CardType | null)[], players: any[]): GameBoardTrickCard[] => {
  if (!currentTrick || !currentTrick.length) return [];
  
  return currentTrick
    .filter((card): card is CardType => card !== null)
    .map((card) => {
      // Find player index who played this card
      const playerIndex = players.findIndex(player => 
        player.hand.some((handCard: any) => handCard.id === card.id)
      );
      
      return {
        player: playerIndex >= 0 ? playerIndex : 0,
        suit: SUIT_SYMBOLS[card.suit] || card.suit,
        rank: RANK_DISPLAY[card.rank] || card.rank,
      };
    });
};

const GamePage: React.FC = () => {
  const game = useGame();

  // Extract game state values for easier use
  const {
    players,
    currentTrick,
    gamePhase,
    currentPlayerIndex,
    isLoading,
    // Actions
    setGamePhase,
    playCard,
    placeBid,
    setGameStarted
  } = game;

  // Handlers for the UI
  const handleStartGame = (e: React.MouseEvent) => {
    setGamePhase('bidding');
    setGameStarted(true);
  };

  const handleEndGame = (e: React.MouseEvent) => {
    setGamePhase('scoring');
    // If calculateScores exists in game, call it
    if ('calculateScores' in game) {
      (game as any).calculateScores();
    }
  };

  const handleBid = (bid: number) => {
    const currentPlayer = players[currentPlayerIndex];
    if (currentPlayer) {
      placeBid(currentPlayer.id, []);
    }
  };

  const handleCardPlay = (card: any) => {
    const currentPlayer = players[currentPlayerIndex];
    if (currentPlayer) {
      playCard(currentPlayer.id, card);
    }
  };

  // UI state derived from game state
  const uiState = {
    isBidding: gamePhase === 'bidding',
    isPlaying: gamePhase === 'playing',
    isLoading,
  };

  // Get current player for UI with type cast to handle the bid property
  const playerState = players[currentPlayerIndex] || { id: '', name: '' };
  // Create a compatible currentBid value
  const currentBid = (playerState as any).bid ?? null;

  // Transform the currentTrick to match the expected format
  const gameBoardCurrentTrick = adaptCurrentTrick(currentTrick, players);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Ninety-Nine Card Game</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main game board */}
          <div className="lg:col-span-3">
            <GameBoard
              players={players as unknown as GameBoardPlayer[]}
              currentTrick={gameBoardCurrentTrick}
              onCardPlay={handleCardPlay}
            />
          </div>

          {/* Game controls */}
          <div className="lg:col-span-1">
            <GameControls
              isBidding={uiState.isBidding}
              isPlaying={uiState.isPlaying}
              currentBid={currentBid}
              onBid={handleBid}
              onStartGame={handleStartGame}
              onEndGame={handleEndGame}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Page() {
  return (
    <Provider store={store}>
      <DndProvider>
        <GamePage />
      </DndProvider>
    </Provider>
  );
} 