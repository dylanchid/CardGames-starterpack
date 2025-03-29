/**
 * @fileoverview Game state synchronization manager
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { GameState } from '../../types/core/GameTypes';

export class GameSync {
  private isSyncing: boolean = false;
  private lastSyncTimestamp: number = 0;
  private syncQueue: GameState[] = [];
  private syncInterval: number = 1000; // Minimum time between syncs
  
  constructor(
    private supabase: SupabaseClient,
    private sessionId: string
  ) {}
  
  async sendFullSync(state: GameState) {
    if (this.isSyncing) {
      // Queue the sync if we're already syncing
      this.syncQueue.push(state);
      return;
    }
    
    const now = Date.now();
    if (now - this.lastSyncTimestamp < this.syncInterval) {
      // Queue the sync if we're syncing too frequently
      this.syncQueue.push(state);
      return;
    }
    
    try {
      this.isSyncing = true;
      
      // Update the last sync timestamp
      this.lastSyncTimestamp = now;
      
      // Prepare the sync payload
      const syncPayload = {
        session_id: this.sessionId,
        state: state,
        timestamp: now,
        version: this.calculateStateVersion(state),
      };
      
      // Send the sync to the server
      const { error } = await this.supabase
        .from('game_states')
        .upsert(syncPayload, {
          onConflict: 'session_id',
        });
      
      if (error) {
        throw error;
      }
      
      // Process any queued syncs
      await this.processSyncQueue();
    } catch (error) {
      console.error('Error during full sync:', error);
      // Requeue the failed sync
      this.syncQueue.push(state);
    } finally {
      this.isSyncing = false;
    }
  }
  
  async sendPartialSync(updates: Partial<GameState>) {
    if (this.isSyncing) {
      // Queue the partial sync
      this.syncQueue.push(updates as GameState);
      return;
    }
    
    try {
      this.isSyncing = true;
      
      // Get the current state from the server
      const { data: currentState, error: fetchError } = await this.supabase
        .from('game_states')
        .select('state')
        .eq('session_id', this.sessionId)
        .single();
      
      if (fetchError) {
        throw fetchError;
      }
      
      // Merge the updates with the current state
      const mergedState = this.mergeStates(currentState.state, updates);
      
      // Send the merged state
      await this.sendFullSync(mergedState);
      
      // Process any queued syncs
      await this.processSyncQueue();
    } catch (error) {
      console.error('Error during partial sync:', error);
      // Requeue the failed sync
      this.syncQueue.push(updates as GameState);
    } finally {
      this.isSyncing = false;
    }
  }
  
  private async processSyncQueue() {
    while (this.syncQueue.length > 0) {
      const nextSync = this.syncQueue.shift();
      if (!nextSync) break;
      
      await this.sendFullSync(nextSync);
    }
  }
  
  private mergeStates(current: GameState, updates: Partial<GameState>): GameState {
    // Deep merge the updates with the current state
    return {
      ...current,
      ...updates,
      entities: {
        ...current.entities,
        ...updates.entities,
      },
      relationships: {
        ...current.relationships,
        ...updates.relationships,
      },
      ui: {
        ...current.ui,
        ...updates.ui,
      },
    };
  }
  
  private calculateStateVersion(state: GameState): number {
    // Calculate a version number based on the state's content
    // This can be used for conflict resolution
    let version = 0;
    
    // Add version components based on state changes
    version += Object.keys(state.entities.tricks).length * 1000;
    version += Object.keys(state.entities.bids).length * 100;
    version += (state.core.lastActionTimestamp || 0) * 10;
    version += state.relationships.playerOrder.length;
    
    return version;
  }
  
  stop() {
    // Clear the sync queue
    this.syncQueue = [];
    this.isSyncing = false;
  }
} 