/**
 * @fileoverview Manages game state and state change notifications
 */

import { GameState as RealtimeGameState } from '@/app/game/types/core/GameTypes';
import { StateChangeHandler, ErrorHandler } from './RealtimeManager';

export class StateManager {
  private currentState: RealtimeGameState | null = null;
  private subscribers: StateChangeHandler[] = [];
  private errorHandlers: ErrorHandler[] = [];

  getCurrentState(): RealtimeGameState | null {
    return this.currentState;
  }

  updateState(state: RealtimeGameState) {
    this.currentState = state;
    this.notifySubscribers(state);
  }

  subscribe(handler: StateChangeHandler) {
    this.subscribers.push(handler);
    return () => {
      this.subscribers = this.subscribers.filter(h => h !== handler);
    };
  }

  onError(handler: ErrorHandler) {
    this.errorHandlers.push(handler);
    return () => {
      this.errorHandlers = this.errorHandlers.filter(h => h !== handler);
    };
  }

  notifySubscribers(state: RealtimeGameState) {
    this.subscribers.forEach(handler => handler(state));
  }

  notifyError(error: Error) {
    this.errorHandlers.forEach(handler => handler(error));
  }

  cleanup() {
    this.subscribers = [];
    this.errorHandlers = [];
    this.currentState = null;
  }
} 