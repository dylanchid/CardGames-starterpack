'use client';

import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { GameBoard } from './components/GameBoard/GameBoard';
import { GameControls } from './components/GameControls/GameControls';
import { useGame } from './components/core/GameProvider';
import { useBidding } from './components/features/bidding/BiddingProvider';
import DndProvider from './components/DndProvider';
import { z } from 'zod';
import { CardType, Suit, Rank, SUIT_SYMBOLS, RANK_DISPLAY } from './types/card';
import { Player as InternalPlayer } from './types/core/GameTypes';
import { Player as ExternalPlayer, Bid as ExternalBid, Trick as ExternalTrick } from './types/core/GameTypes';
import { adaptBid, adaptPlayer, adaptTrick } from './types/core/TypeAdapters';
import { GameProvider } from './components/core/GameProvider';
import GameRoot from './components/GameRoot';

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

// Helper function to adapt current trick for GameBoard
const adaptCurrentTrick = (cards: CardType[], players: InternalPlayer[]): GameBoardTrickCard[] => {
  return cards.map((card, index) => ({
    player: index % players.length,
    suit: SUIT_SYMBOLS[card.suit] || card.suit,
    rank: RANK_DISPLAY[card.rank] || card.rank,
  }));
};

// Adapter function to transform core Player type to GameBoard Player type
const adaptPlayerForGameBoard = (player: InternalPlayer) => ({
  id: player.id,
  name: player.name,
  handIds: player.hand,
  bidCardIds: player.bids,
  tricksWon: player.tricks.length,
  score: player.score,
  isActive: player.isReady,
  isReady: player.isReady,
  isAI: player.isAI,
  rating: player.rating,
  aiLevel: player.aiLevel
});

const GamePage: React.FC = () => {
  const game = useGame();
  const bidding = useBidding();

  // Extract game state values for easier use
  const {
    state: {
      entities: { players },
      relationships: { currentTrick },
      core: { phase: gamePhase }
    },
    actions: {
      setPhase: setGamePhase,
      playCard,
      addBid: placeBid
    },
    queries: {
      getCurrentPlayer,
      getCurrentTrick
    }
  } = game;

  const currentPlayer = getCurrentPlayer();
  const currentTrickData = getCurrentTrick();
  const currentPlayerIndex = currentPlayer ? Object.values(players).findIndex(p => p.id === currentPlayer.id) : -1;
  const isLoading = false; // TODO: Add isLoading to state

  // Handlers for the UI
  const handleStartGame = (e: React.MouseEvent) => {
    // Get all player IDs in order
    const playerIds = Object.values(players).map(p => p.id);
    
    // Initialize bidding state with player order
    bidding.startBidding(playerIds);
    
    // Wait for the next tick to ensure the state is updated
    setTimeout(() => {
      // Set game phase to bidding
      setGamePhase('bidding');
    }, 0);
  };

  const handleEndGame = (e: React.MouseEvent) => {
    setGamePhase('scoring');
    // If calculateScores exists in game, call it
    if ('calculateScores' in game) {
      (game as any).calculateScores();
    }
  };

  const handleBid = (bid: number) => {
    if (currentPlayer) {
      const bidData: ExternalBid = {
        id: `bid-${Date.now()}`,
        playerId: currentPlayer.id,
        cardIds: [], // This will be populated by the game logic
        value: bid,
        timestamp: Date.now(),
        roundNumber: 1, // This should come from game state
        isRevealed: false
      };
      placeBid(adaptBid(bidData));
    }
  };

  const handleCardPlay = (card: { id: string; suit: string; rank: string; position: { x: number; y: number; zIndex: number; }; }) => {
    if (currentPlayer) {
      playCard(card.id);
    }
  };

  // UI state derived from game state
  const uiState = {
    isBidding: gamePhase === 'bidding',
    isPlaying: gamePhase === 'playing',
    isLoading
  };

  // Get current player for UI with type cast to handle the bid property
  const playerState = currentPlayer || { id: '', name: '' };
  // Create a compatible currentBid value
  const currentBid = (playerState as any).bid ?? null;

  // Transform the currentTrick to match the expected format
  const gameBoardCurrentTrick = currentTrickData ? adaptCurrentTrick(
    currentTrickData.cards.map(card => ({
      id: card.cardId,
      suit: Suit.HEARTS, // Default to HEARTS, will be updated by game logic
      rank: Rank.ACE, // Default to ACE, will be updated by game logic
      isFaceUp: true,
      position: { x: 0, y: 0, zIndex: 1 }
    })), 
    Object.values(players)
  ) : [];

  // Transform players to match GameBoard expected type
  const transformedPlayers = Object.values(players).map(adaptPlayerForGameBoard);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Ninety-Nine Card Game</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main game board */}
          <div className="lg:col-span-3">
            <GameBoard
              players={transformedPlayers}
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
    <GameRoot>
      <GamePage />
    </GameRoot>
  );
} 