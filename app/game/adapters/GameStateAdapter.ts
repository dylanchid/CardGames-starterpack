/**
 * @fileoverview Adapter to convert between app and realtime GameState types
 */

import { GameState as AppGameState } from '@/app/types/core/GameTypes';
import { GameState as RealtimeGameState } from '@/app/game/types/core/GameTypes';

export class GameStateAdapter {
  /**
   * Convert from app GameState to realtime GameState
   */
  static toRealtimeState(appState: AppGameState): RealtimeGameState {
    return {
      game: {
        phase: appState.core.phase,
        roundNumber: 0, // TODO: Add to app state
        settings: {
          maxRounds: appState.core.settings.maxPlayers,
          maxTricks: appState.core.settings.roundTimeLimit,
          cardsPerPlayer: 13,
          timeLimit: appState.core.settings.trickTimeLimit,
          allowTrump: false,
        },
        error: appState.core.error ? {
          type: 'UNKNOWN',
          message: appState.core.error,
          details: null,
        } : null,
      },
      entities: {
        players: appState.entities.players,
        cards: {}, // TODO: Add to app state
        tricks: appState.entities.tricks,
        bids: appState.entities.bids,
      },
      relationships: appState.relationships,
      ui: {
        selectedCards: appState.ui.selectedCards,
        draggedCard: appState.ui.draggedCard,
        isAnimating: appState.ui.animationState.isAnimating,
      },
    };
  }

  /**
   * Convert from realtime GameState to app GameState
   */
  static toAppState(realtimeState: RealtimeGameState): AppGameState {
    return {
      core: {
        phase: realtimeState.game.phase,
        settings: {
          maxPlayers: realtimeState.game.settings.maxRounds,
          minPlayers: 2,
          roundTimeLimit: realtimeState.game.settings.maxTricks,
          trickTimeLimit: realtimeState.game.settings.timeLimit || 30,
          allowUndo: true,
          allowRedo: true,
          autoPlay: false,
          soundEnabled: true,
          animationsEnabled: true,
        },
        error: realtimeState.game.error?.message || null,
        lastAction: null,
        lastActionTimestamp: null,
      },
      entities: {
        players: realtimeState.entities.players,
        tricks: realtimeState.entities.tricks,
        bids: realtimeState.entities.bids,
      },
      relationships: realtimeState.relationships,
      ui: {
        selectedCards: realtimeState.ui.selectedCards,
        draggedCard: realtimeState.ui.draggedCard,
        animationState: {
          isAnimating: realtimeState.ui.isAnimating,
          currentAnimation: null,
          animationQueue: [],
        },
      },
    };
  }
} 