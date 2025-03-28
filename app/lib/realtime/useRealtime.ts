/**
 * @fileoverview React hook for using the realtime manager
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { RealtimeManager, GameEvent, GameMessage, EventListener } from './RealtimeManager';

/**
 * Hook for using the realtime manager in React components
 */
export function useRealtime(userId?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const managerRef = useRef<RealtimeManager | null>(null);

  // Initialize the manager
  useEffect(() => {
    // Create the manager instance
    managerRef.current = new RealtimeManager();
    
    // Set the user ID if provided
    if (userId) {
      managerRef.current.setUserId(userId);
    }
    
    // Clean up on unmount
    return () => {
      if (managerRef.current) {
        managerRef.current.disconnect();
        managerRef.current = null;
      }
    };
  }, [userId]);

  // Update user ID when it changes
  useEffect(() => {
    if (managerRef.current && userId) {
      managerRef.current.setUserId(userId);
    }
  }, [userId]);

  /**
   * Connect to a game session
   */
  const connect = useCallback(async (gameSessionId: string) => {
    try {
      if (!managerRef.current) {
        throw new Error('Realtime manager not initialized');
      }
      
      setError(null);
      const success = await managerRef.current.connect(gameSessionId);
      
      if (success) {
        setIsConnected(true);
        setSessionId(gameSessionId);
      } else {
        setError('Failed to connect to game session');
        setIsConnected(false);
        setSessionId(null);
      }
      
      return success;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
      setIsConnected(false);
      setSessionId(null);
      return false;
    }
  }, []);

  /**
   * Disconnect from the current session
   */
  const disconnect = useCallback(async () => {
    try {
      if (!managerRef.current) {
        return;
      }
      
      await managerRef.current.disconnect();
      setIsConnected(false);
      setSessionId(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(message);
    }
  }, []);

  /**
   * Send a message to the current session
   */
  const sendMessage = useCallback((eventType: GameEvent, payload: any) => {
    if (!managerRef.current || !isConnected) {
      setError('Cannot send message: not connected');
      return Promise.resolve(false);
    }
    
    return managerRef.current.sendMessage(eventType, payload);
  }, [isConnected]);

  /**
   * Add an event listener
   */
  const addEventListener = useCallback((eventType: GameEvent, listener: EventListener) => {
    if (!managerRef.current) {
      setError('Cannot add listener: realtime manager not initialized');
      return;
    }
    
    managerRef.current.addEventListener(eventType, listener);
  }, []);

  /**
   * Remove an event listener
   */
  const removeEventListener = useCallback((eventType: GameEvent, listener: EventListener) => {
    if (!managerRef.current) {
      return;
    }
    
    managerRef.current.removeEventListener(eventType, listener);
  }, []);

  /**
   * Add a listener with automatic cleanup
   */
  const useEventListener = useCallback((eventType: GameEvent, listener: EventListener) => {
    useEffect(() => {
      addEventListener(eventType, listener);
      return () => removeEventListener(eventType, listener);
    }, [eventType, listener]);
  }, [addEventListener, removeEventListener]);

  return {
    isConnected,
    error,
    sessionId,
    connect,
    disconnect,
    sendMessage,
    addEventListener,
    removeEventListener,
    useEventListener,
  };
} 