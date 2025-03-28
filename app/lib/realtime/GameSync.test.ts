/**
 * @fileoverview Tests for the GameSync class
 */

import GameSync from './GameSync';
import type { RealtimeManager } from './RealtimeManager';
import { GamePhase } from '@/app/game/types/core/GameTypes';
import { AppDispatch } from '@/app/game/store/store';
import { Card, CardRank, CardSuit } from '@/app/game/types/cards/CardTypes';
import { PlayerBid } from '@/app/game/types/bidding/BiddingTypes';

// Mock dependencies
jest.mock('./RealtimeManager', () => ({
  __esModule: true,
}));

describe('GameSync', () => {
  // Mock RealtimeManager
  const mockSendMessage = jest.fn();
  const mockAddEventListener = jest.fn();
  const mockManager: Partial<RealtimeManager> = {
    sendMessage: mockSendMessage,
    addEventListener: mockAddEventListener,
  };

  // Mock dispatch
  const mockDispatch = jest.fn() as jest.MockedFunction<AppDispatch>;

  let gameSync: GameSync;

  beforeEach(() => {
    jest.clearAllMocks();
    gameSync = new GameSync(mockManager as RealtimeManager, mockDispatch);
  });

  it('should initialize with the provided manager and dispatch', () => {
    expect(gameSync).toBeDefined();
    expect(mockAddEventListener).toHaveBeenCalledTimes(1);
    expect(mockAddEventListener).toHaveBeenCalledWith('message', expect.any(Function));
  });

  it('should set session ID', () => {
    const sessionId = 'test-session-id';
    gameSync.setSessionId(sessionId);
    
    expect(gameSync['sessionId']).toBe(sessionId);
  });

  it('should send a full sync message', () => {
    const sessionId = 'test-session-id';
    gameSync.setSessionId(sessionId);

    const gameState = {
      gamePhase: 'bidding' as GamePhase,
      roundNumber: 1,
      tricksPlayed: 0,
      currentPlayerIndex: 0,
      currentTrickLeader: 0,
    };

    const players = {
      players: [
        { id: 'player1', name: 'Player 1', hand: [], tricks: [], bid: null },
        { id: 'player2', name: 'Player 2', hand: [], tricks: [], bid: null },
      ]
    };

    gameSync.sendFullSync(gameState, players);

    expect(mockSendMessage).toHaveBeenCalledWith({
      operation: 'full_sync',
      data: {
        gamePhase: 'bidding',
        roundNumber: 1,
        tricksPlayed: 0,
        currentPlayerIndex: 0,
        currentTrickLeader: 0,
        players: [
          { id: 'player1', name: 'Player 1', hand: [], tricks: [], bid: null },
          { id: 'player2', name: 'Player 2', hand: [], tricks: [], bid: null },
        ]
      },
      timestamp: expect.any(Number),
    });
  });

  it('should send a card play message', () => {
    const sessionId = 'test-session-id';
    gameSync.setSessionId(sessionId);
    
    const playerId = 'player1';
    const card: Card = {
      id: 'c1',
      suit: 'hearts' as CardSuit,
      rank: '10' as CardRank,
    };
    
    gameSync.sendCardPlay(playerId, card);
    
    expect(mockSendMessage).toHaveBeenCalledWith({
      operation: 'card_play',
      data: { playerId, card },
      timestamp: expect.any(Number),
    });
  });

  it('should send a bid place message', () => {
    const sessionId = 'test-session-id';
    gameSync.setSessionId(sessionId);
    
    const playerId = 'player1';
    const bid: PlayerBid = {
      playerId: 'player1',
      bidValue: 3,
      isRevealed: false
    };
    
    gameSync.sendBidPlace(playerId, bid);
    
    expect(mockSendMessage).toHaveBeenCalledWith({
      operation: 'bid_place',
      data: { playerId, bid },
      timestamp: expect.any(Number),
    });
  });

  it('should send a bid reveal message', () => {
    const sessionId = 'test-session-id';
    gameSync.setSessionId(sessionId);
    
    const playerId = 'player1';
    const bid: PlayerBid = {
      playerId: 'player1',
      bidValue: 3,
      isRevealed: true
    };
    
    gameSync.sendBidReveal(playerId, bid);
    
    expect(mockSendMessage).toHaveBeenCalledWith({
      operation: 'bid_reveal',
      data: { playerId, bid },
      timestamp: expect.any(Number),
    });
  });

  it('should send a phase change message', () => {
    const sessionId = 'test-session-id';
    gameSync.setSessionId(sessionId);
    
    const newPhase: GamePhase = 'playing';
    
    gameSync.sendPhaseChange(newPhase);
    
    expect(mockSendMessage).toHaveBeenCalledWith({
      operation: 'phase_change',
      data: { phase: newPhase },
      timestamp: expect.any(Number),
    });
  });
}); 