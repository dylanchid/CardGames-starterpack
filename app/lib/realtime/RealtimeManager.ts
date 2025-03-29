/**
 * @fileoverview Real-time synchronization manager
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { GameState as AppGameState } from '@/app/types/core/GameTypes';
import { GameState as RealtimeGameState } from '@/app/game/types/core/GameTypes';
import { GameSync } from '@/app/lib/realtime/GameSync';
import { ConflictResolver } from '@/app/lib/realtime/ConflictResolver';
import { StateManager } from '@/app/lib/realtime/StateManager';
import { ConnectionManager } from '@/app/lib/realtime/ConnectionManager';
import { GameStateAdapter } from '@/app/game/adapters/GameStateAdapter';

export type StateChangeHandler = (state: RealtimeGameState) => void;
export type ErrorHandler = (error: Error) => void;
export type ConnectionHandler = () => void;

export class RealtimeManager {
  private sync: GameSync;
  private conflictResolver: ConflictResolver;
  private stateManager: StateManager;
  private connectionManager: ConnectionManager;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private syncInterval: number = 10000;
  private syncIntervalId: NodeJS.Timeout | null = null;
  
  constructor(
    private supabase: SupabaseClient,
    private sessionId: string,
    private userId: string
  ) {
    this.sync = new GameSync(supabase, sessionId);
    this.conflictResolver = new ConflictResolver();
    this.stateManager = new StateManager();
    this.connectionManager = new ConnectionManager(supabase);
  }
  
  async initialize() {
    try {
      // Set up connection with retry logic
      await this.connectionManager.connect(this.sessionId);
      
      // Subscribe to game state changes
      this.subscribeToGameState();
      
      // Set up periodic sync
      this.setupPeriodicSync();
      
      // Set up conflict resolution
      this.setupConflictResolution();
      
      // Set up connection monitoring
      this.setupConnectionMonitoring();
      
      // Reset reconnect attempts on successful connection
      this.reconnectAttempts = 0;
    } catch (error) {
      console.error('Failed to initialize real-time manager:', error);
      await this.handleConnectionError(error);
    }
  }
  
  private subscribeToGameState() {
    this.supabase
      .channel(`game:${this.sessionId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'game_states',
        filter: `session_id=eq.${this.sessionId}`
      }, (payload) => {
        this.handleStateChange(payload);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to game state changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Failed to subscribe to game state changes');
        }
      });
  }
  
  private async handleStateChange(payload: any) {
    try {
      // Get current local state
      const localState = this.stateManager.getCurrentState();
      if (!localState) {
        console.warn('No local state available, using remote state');
        this.stateManager.updateState(payload.new);
        this.notifyStateChange(payload.new);
        return;
      }
      
      // Resolve conflicts if any
      const resolvedState = await this.conflictResolver.resolve(
        localState,
        payload.new
      );
      
      // Update local state
      this.stateManager.updateState(resolvedState);
      
      // Trigger UI update
      this.notifyStateChange(resolvedState);
    } catch (error) {
      console.error('Error handling state change:', error);
      // Notify error to UI
      this.notifyError(error);
    }
  }
  
  private setupPeriodicSync() {
    // Clear any existing interval
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
    }
    
    // Set up new interval
    this.syncIntervalId = setInterval(() => {
      const currentState = this.stateManager.getCurrentState();
      if (currentState) {
        // Convert to app state before sending to sync
        const appState = GameStateAdapter.toAppState(currentState);
        this.sync.sendFullSync(appState);
      }
    }, this.syncInterval);
  }
  
  private setupConflictResolution() {
    this.conflictResolver.onConflict((local: RealtimeGameState, remote: RealtimeGameState) => {
      return this.resolveConflict(local, remote);
    });
  }
  
  private setupConnectionMonitoring() {
    this.connectionManager.onDisconnect(() => {
      this.handleDisconnect();
    });
    
    this.connectionManager.onReconnect(() => {
      this.handleReconnect();
    });
  }
  
  private async handleConnectionError(error: any) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.initialize();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.notifyError(new Error('Failed to establish connection after multiple attempts'));
    }
  }
  
  private handleDisconnect() {
    console.log('Connection lost, attempting to reconnect...');
    this.handleConnectionError(new Error('Connection lost'));
  }
  
  private handleReconnect() {
    console.log('Connection restored');
    this.reconnectAttempts = 0;
    // Resubscribe to game state changes
    this.subscribeToGameState();
    // Send full sync to ensure state consistency
    const currentState = this.stateManager.getCurrentState();
    if (currentState) {
      // Convert to app state before sending to sync
      const appState = GameStateAdapter.toAppState(currentState);
      this.sync.sendFullSync(appState);
    }
  }
  
  private async resolveConflict(local: RealtimeGameState, remote: RealtimeGameState): Promise<RealtimeGameState> {
    // Convert to app state for comparison
    const localAppState = GameStateAdapter.toAppState(local);
    const remoteAppState = GameStateAdapter.toAppState(remote);
    
    // Compare timestamps
    const localTimestamp = localAppState.core.lastActionTimestamp || 0;
    const remoteTimestamp = remoteAppState.core.lastActionTimestamp || 0;
    
    if (localTimestamp > remoteTimestamp) {
      return local;
    }
    
    // If timestamps are equal, use more sophisticated resolution
    if (localTimestamp === remoteTimestamp) {
      // Compare specific fields that are more likely to be correct
      const localScore = this.calculateStateScore(localAppState);
      const remoteScore = this.calculateStateScore(remoteAppState);
      
      return localScore >= remoteScore ? local : remote;
    }
    
    return remote;
  }
  
  private calculateStateScore(state: AppGameState): number {
    // Implement a scoring system for state validity
    // For example, count completed actions, valid moves, etc.
    let score = 0;
    
    // Add points for completed actions
    score += Object.keys(state.entities.tricks).length * 10;
    score += Object.keys(state.entities.bids).length * 5;
    
    // Add points for valid relationships
    if (state.relationships.currentTrick) score += 5;
    if (state.relationships.currentPlayer) score += 5;
    
    // Add points for game progress
    score += state.core.lastActionTimestamp ? 2 : 0;
    
    return score;
  }
  
  private notifyStateChange(state: RealtimeGameState) {
    // Notify all subscribers of state change
    this.stateManager.notifySubscribers(state);
  }
  
  private notifyError(error: any) {
    // Notify error to UI
    this.stateManager.notifyError(error);
  }
  
  async cleanup() {
    // Clear sync interval
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
    
    // Disconnect from real-time
    await this.connectionManager.disconnect();
    
    // Stop sync
    this.sync.stop();
    
    // Clean up state manager
    this.stateManager.cleanup();
  }

  // Public methods for event handling
  onStateChange(handler: StateChangeHandler) {
    this.stateManager.subscribe(handler);
  }

  onError(handler: ErrorHandler) {
    this.stateManager.onError(handler);
  }

  onDisconnect(handler: ConnectionHandler) {
    this.connectionManager.onDisconnect(handler);
  }

  onReconnect(handler: ConnectionHandler) {
    this.connectionManager.onReconnect(handler);
  }

  isConnected(): boolean {
    return this.connectionManager.isConnectionActive();
  }

  updateState(state: RealtimeGameState) {
    this.stateManager.updateState(state);
  }
} 