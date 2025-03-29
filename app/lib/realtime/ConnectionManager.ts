/**
 * @fileoverview Manages real-time connection state and events
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { ConnectionHandler } from './RealtimeManager';

export class ConnectionManager {
  private isActive: boolean = false;
  private disconnectHandlers: ConnectionHandler[] = [];
  private reconnectHandlers: ConnectionHandler[] = [];
  private channel: any = null;

  constructor(private supabase: SupabaseClient) {}

  async connect(sessionId: string) {
    try {
      // Subscribe to connection state changes
      this.channel = this.supabase.channel(`connection:${sessionId}`);
      
      this.channel
        .on('presence', { event: 'sync' }, () => {
          this.handleReconnect();
        })
        .on('presence', { event: 'leave' }, () => {
          this.handleDisconnect();
        })
        .subscribe(async (status: string) => {
          if (status === 'SUBSCRIBED') {
            this.isActive = true;
            console.log('Successfully connected to real-time channel');
          } else if (status === 'CHANNEL_ERROR') {
            this.isActive = false;
            console.error('Failed to connect to real-time channel');
          }
        });
    } catch (error) {
      console.error('Error connecting to real-time:', error);
      this.handleDisconnect();
      throw error;
    }
  }

  async disconnect() {
    if (this.channel) {
      await this.channel.unsubscribe();
      this.channel = null;
      this.isActive = false;
    }
  }

  onDisconnect(handler: ConnectionHandler) {
    this.disconnectHandlers.push(handler);
    return () => {
      this.disconnectHandlers = this.disconnectHandlers.filter(h => h !== handler);
    };
  }

  onReconnect(handler: ConnectionHandler) {
    this.reconnectHandlers.push(handler);
    return () => {
      this.reconnectHandlers = this.reconnectHandlers.filter(h => h !== handler);
    };
  }

  isConnectionActive(): boolean {
    return this.isActive;
  }

  private handleDisconnect() {
    this.isActive = false;
    this.disconnectHandlers.forEach(handler => handler());
  }

  private handleReconnect() {
    this.isActive = true;
    this.reconnectHandlers.forEach(handler => handler());
  }
} 