/**
 * @fileoverview Realtime manager for WebSocket connections
 */

import { createClient, RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

/**
 * Event types
 */
export type GameEvent = 
  | 'game_update'
  | 'player_join'
  | 'player_leave'
  | 'card_play'
  | 'bid_made'
  | 'trick_complete'
  | 'round_complete'
  | 'game_complete'
  | 'chat_message'
  | 'state_sync';

/**
 * Game message type
 */
export interface GameMessage {
  eventType: GameEvent;
  senderId: string;
  sessionId: string;
  timestamp: number;
  payload: any;
}

/**
 * Realtime connection manager options
 */
export interface RealtimeManagerOptions {
  autoReconnect: boolean;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  presenceEnabled: boolean;
}

/**
 * Listener function type
 */
export type EventListener = (message: GameMessage) => void;

/**
 * Default options
 */
const defaultOptions: RealtimeManagerOptions = {
  autoReconnect: true,
  reconnectInterval: 5000,
  maxReconnectAttempts: 10,
  presenceEnabled: true,
};

/**
 * Class for managing realtime WebSocket connections for games
 */
export class RealtimeManager {
  private supabase: SupabaseClient;
  private channel: RealtimeChannel | null = null;
  private eventListeners: Map<GameEvent, Set<EventListener>> = new Map();
  private options: RealtimeManagerOptions;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnected = false;
  private userId: string | null = null;
  private sessionId: string | null = null;

  constructor(options: Partial<RealtimeManagerOptions> = {}) {
    this.options = { ...defaultOptions, ...options };
    this.supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  /**
   * Set the current user ID
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Initialize a connection for a game session
   */
  async connect(sessionId: string): Promise<boolean> {
    try {
      if (this.channel) {
        await this.disconnect();
      }

      this.sessionId = sessionId;
      this.channel = this.supabase.channel(`game:${sessionId}`, {
        config: {
          presence: {
            key: this.userId ?? undefined,
          },
        },
      });

      // Set up presence tracking
      if (this.options.presenceEnabled && this.userId) {
        this.channel.on('presence', { event: 'sync' }, () => {
          const state = this.channel?.presenceState() || {};
          // Handle presence sync
          console.log('Presence synced', state);
        });

        this.channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
          // Handle player join
          console.log('Player joined', key, newPresences);
        });

        this.channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          // Handle player leave
          console.log('Player left', key, leftPresences);
        });

        // Track user presence
        await this.channel.track({
          user_id: this.userId,
          online_at: new Date().toISOString(),
        });
      }

      // Listen for broadcast messages
      this.channel.on('broadcast', { event: '*' }, (payload) => {
        const message = payload.payload as GameMessage;
        const listeners = this.eventListeners.get(message.eventType);
        
        if (listeners) {
          listeners.forEach(listener => listener(message));
        }
      });

      // Subscribe to the channel
      const status = await this.channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          console.log(`Connected to game:${sessionId}`);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          this.isConnected = false;
          console.error(`Connection to game:${sessionId} closed or errored`);
          this.handleDisconnect();
        }
      });

      return this.isConnected;
    } catch (error) {
      console.error('Error connecting to realtime channel:', error);
      this.handleDisconnect();
      return false;
    }
  }

  /**
   * Disconnect from the current channel
   */
  async disconnect(): Promise<void> {
    if (this.channel) {
      await this.channel.unsubscribe();
      this.channel = null;
    }
    
    this.isConnected = false;
    this.sessionId = null;
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Handle disconnection and potential reconnection
   */
  private handleDisconnect(): void {
    if (!this.options.autoReconnect || !this.sessionId) {
      return;
    }

    if (this.reconnectAttempts < this.options.maxReconnectAttempts) {
      this.reconnectAttempts += 1;
      
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
      }
      
      this.reconnectTimer = setTimeout(async () => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.options.maxReconnectAttempts})...`);
        await this.connect(this.sessionId!);
      }, this.options.reconnectInterval);
    } else {
      console.error(`Max reconnect attempts (${this.options.maxReconnectAttempts}) reached.`);
    }
  }

  /**
   * Send a message to the channel
   */
  sendMessage(eventType: GameEvent, payload: any): Promise<boolean> {
    if (!this.channel || !this.isConnected || !this.sessionId || !this.userId) {
      console.error('Cannot send message: not connected or missing user/session ID');
      return Promise.resolve(false);
    }

    const message: GameMessage = {
      eventType,
      senderId: this.userId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      payload,
    };

    return this.channel.send({
      type: 'broadcast',
      event: eventType,
      payload: message,
    }).then(() => true)
      .catch(error => {
        console.error('Error sending message:', error);
        return false;
      });
  }

  /**
   * Add an event listener
   */
  addEventListener(eventType: GameEvent, listener: EventListener): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(listener);
  }

  /**
   * Remove an event listener
   */
  removeEventListener(eventType: GameEvent, listener: EventListener): void {
    if (this.eventListeners.has(eventType)) {
      this.eventListeners.get(eventType)!.delete(listener);
    }
  }

  /**
   * Get the connection status
   */
  isConnectionActive(): boolean {
    return this.isConnected;
  }

  /**
   * Get the current session ID
   */
  getSessionId(): string | null {
    return this.sessionId;
  }
} 