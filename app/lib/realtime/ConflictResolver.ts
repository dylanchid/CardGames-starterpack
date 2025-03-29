/**
 * @fileoverview Handles resolution of state conflicts in real-time sync
 */

import { GameState as RealtimeGameState } from '@/app/game/types/core/GameTypes';
import { GameStateAdapter } from '@/app/game/adapters/GameStateAdapter';

type ConflictHandler = (local: RealtimeGameState, remote: RealtimeGameState) => Promise<RealtimeGameState>;

export class ConflictResolver {
  private conflictHandler: ConflictHandler | null = null;

  onConflict(handler: ConflictHandler) {
    this.conflictHandler = handler;
  }

  async resolve(local: RealtimeGameState, remote: RealtimeGameState): Promise<RealtimeGameState> {
    if (!this.conflictHandler) {
      // Default to remote state if no handler is set
      return remote;
    }

    return this.conflictHandler(local, remote);
  }
} 