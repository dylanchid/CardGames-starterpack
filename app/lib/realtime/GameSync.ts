/**
 * @fileoverview Game synchronization service
 */

import { RealtimeManager, GameEvent } from './RealtimeManager';
import { AppDispatch, RootState } from '@/app/game/store/store';
import { 
  setGamePhase, 
  setRoundNumber, 
  setTricksPlayed, 
  setCurrentPlayerIndex,
  setError,
  setCurrentTrickLeader
} from '@/app/game/store/slices/game/gameSlice';
import { batchUpdatePlayers } from '@/app/game/store/slices/player/playerSlice';
import { playCard } from '@/app/game/store/slices/cardPlay/cardPlaySlice';
import { placeBid, revealBid } from '@/app/game/store/slices/bidding/biddingSlice';
import { CardType } from '@/app/game/types/card';
import { Player } from '@/app/game/types/core/PlayerTypes';

/**
 * Game sync operation types
 */
export type SyncOperation = 
  | 'full_sync'
  | 'phase_change'
  | 'player_update'
  | 'card_play'
  | 'bid_place'
  | 'bid_reveal'
  | 'round_update'
  | 'trick_update';

/**
 * Game sync message payload
 */
export interface GameSyncPayload {
  operation: SyncOperation;
  data: any;
  timestamp: number;
}

/**
 * Full sync payload
 */
interface FullSyncPayload {
  gamePhase: string;
  roundNumber: number;
  tricksPlayed: number;
  currentPlayerIndex: number;
  currentTrickLeader: number;
  players: { [key: string]: Player };
}

/**
 * Game sync service
 */
export class GameSync {
  private realtimeManager: RealtimeManager;
  private dispatch: AppDispatch;
  private getState: () => RootState;
  private sessionId: string | null = null;
  private lastSyncTimestamp = 0;

  constructor(realtimeManager: RealtimeManager, dispatch: AppDispatch, getState: () => RootState) {
    this.realtimeManager = realtimeManager;
    this.dispatch = dispatch;
    this.getState = getState;
    
    // Set up event listeners
    this.setupEventListeners();
  }

  /**
   * Set the game session ID
   */
  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
  }

  /**
   * Set up event listeners for game events
   */
  private setupEventListeners(): void {
    // Listen for state sync events
    this.realtimeManager.addEventListener('state_sync', (message) => {
      const payload = message.payload as GameSyncPayload;
      
      // Only process messages newer than the last sync
      if (payload.timestamp <= this.lastSyncTimestamp) {
        return;
      }
      
      this.lastSyncTimestamp = payload.timestamp;
      this.handleSyncOperation(payload);
    });
    
    // Listen for card play events
    this.realtimeManager.addEventListener('card_play', (message) => {
      const { playerId, card } = message.payload;
      this.dispatch(playCard({ playerId, card }));
    });
    
    // Listen for bid events
    this.realtimeManager.addEventListener('bid_made', (message) => {
      const { playerId, bidCards } = message.payload;
      this.dispatch(placeBid({ playerId, bidCards }));
    });
    
    // Listen for bid reveal events
    this.realtimeManager.addEventListener('trick_complete', (message) => {
      // Update game state based on completed trick
      // This would typically update scores, determine winner, etc.
    });
  }

  /**
   * Handle a sync operation
   */
  private handleSyncOperation(payload: GameSyncPayload): void {
    const { operation, data } = payload;
    
    switch (operation) {
      case 'full_sync':
        this.handleFullSync(data);
        break;
      case 'phase_change':
        this.dispatch(setGamePhase(data.phase));
        break;
      case 'player_update':
        this.dispatch(batchUpdatePlayers({ updates: data.updates }));
        break;
      case 'card_play':
        this.dispatch(playCard(data));
        break;
      case 'bid_place':
        this.dispatch(placeBid(data));
        break;
      case 'bid_reveal':
        this.dispatch(revealBid(data));
        break;
      case 'round_update':
        this.dispatch(setRoundNumber(data.roundNumber));
        if (data.tricksPlayed !== undefined) {
          this.dispatch(setTricksPlayed(data.tricksPlayed));
        }
        break;
      case 'trick_update':
        if (data.currentPlayerIndex !== undefined) {
          this.dispatch(setCurrentPlayerIndex(data.currentPlayerIndex));
        }
        if (data.currentTrickLeader !== undefined) {
          this.dispatch(setCurrentTrickLeader(data.currentTrickLeader));
        }
        break;
      default:
        console.warn(`Unknown sync operation: ${operation}`);
    }
  }

  /**
   * Handle a full sync operation
   */
  private handleFullSync(data: FullSyncPayload): void {
    const { 
      gamePhase, 
      roundNumber, 
      tricksPlayed, 
      currentPlayerIndex, 
      currentTrickLeader,
      players 
    } = data;
    
    // Update game state
    this.dispatch(setGamePhase(gamePhase as any));
    this.dispatch(setRoundNumber(roundNumber));
    this.dispatch(setTricksPlayed(tricksPlayed));
    this.dispatch(setCurrentPlayerIndex(currentPlayerIndex));
    this.dispatch(setCurrentTrickLeader(currentTrickLeader));
    
    // Update players
    this.dispatch(batchUpdatePlayers({ updates: players }));
  }

  /**
   * Send a full sync of the game state
   */
  sendFullSync(): Promise<boolean> {
    if (!this.sessionId) {
      console.error('Cannot send sync: no active session');
      return Promise.resolve(false);
    }
    
    const state = this.getState();
    const payload: GameSyncPayload = {
      operation: 'full_sync',
      data: {
        gamePhase: state.game.gamePhase,
        roundNumber: state.game.roundNumber,
        tricksPlayed: state.game.tricksPlayed,
        currentPlayerIndex: state.game.currentPlayerIndex,
        currentTrickLeader: state.game.currentTrickLeader,
        players: state.player.entities,
      },
      timestamp: Date.now(),
    };
    
    return this.realtimeManager.sendMessage('state_sync', payload);
  }

  /**
   * Send a card play event
   */
  sendCardPlay(playerId: string, card: CardType): Promise<boolean> {
    const payload: GameSyncPayload = {
      operation: 'card_play',
      data: { playerId, card },
      timestamp: Date.now(),
    };
    
    return this.realtimeManager.sendMessage('card_play', payload);
  }

  /**
   * Send a bid event
   */
  sendBid(playerId: string, bidCards: CardType[]): Promise<boolean> {
    const payload: GameSyncPayload = {
      operation: 'bid_place',
      data: { playerId, bidCards },
      timestamp: Date.now(),
    };
    
    return this.realtimeManager.sendMessage('bid_made', payload);
  }

  /**
   * Send a phase change event
   */
  sendPhaseChange(phase: string): Promise<boolean> {
    const payload: GameSyncPayload = {
      operation: 'phase_change',
      data: { phase },
      timestamp: Date.now(),
    };
    
    return this.realtimeManager.sendMessage('state_sync', payload);
  }

  /**
   * Send a player update event
   */
  sendPlayerUpdate(updates: { [key: string]: Partial<Player> }): Promise<boolean> {
    const payload: GameSyncPayload = {
      operation: 'player_update',
      data: { updates },
      timestamp: Date.now(),
    };
    
    return this.realtimeManager.sendMessage('state_sync', payload);
  }
} 