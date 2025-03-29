/**
 * @fileoverview Hook for handling game analytics and telemetry
 */

import { useCallback, useEffect, useRef } from 'react';
import { useGame } from '../components/core/GameProvider';
import { useGamePerformance } from './useGamePerformance';
import { useGameErrorHandling } from './useGameErrorHandling';

interface AnalyticsEvent {
  id: string;
  name: string;
  timestamp: number;
  properties: Record<string, unknown>;
}

interface TelemetryData {
  sessionId: string;
  userId: string;
  timestamp: number;
  metrics: {
    frameRate: number;
    renderTime: number;
    stateUpdateTime: number;
    networkLatency: number;
    memoryUsage: number;
  };
  events: AnalyticsEvent[];
}

const TELEMETRY_INTERVAL = 60000; // 1 minute
const MAX_EVENTS_PER_BATCH = 100;

export const useGameAnalytics = () => {
  const { state } = useGame();
  const {
    getFrameRate,
    getAverageRenderTime,
    getAverageStateUpdateTime,
    getAverageNetworkLatency,
    getCurrentMemoryUsage,
  } = useGamePerformance();
  const { handleError } = useGameErrorHandling();
  
  const events = useRef<AnalyticsEvent[]>([]);
  const sessionId = useRef(generateSessionId());
  const lastTelemetryTime = useRef(Date.now());
  
  // Generate session ID
  function generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
  
  // Track event
  const trackEvent = useCallback((
    name: string,
    properties: Record<string, unknown> = {}
  ) => {
    const event: AnalyticsEvent = {
      id: Math.random().toString(36).substring(2, 15),
      name,
      timestamp: Date.now(),
      properties,
    };
    
    events.current.push(event);
    
    // Trim events if needed
    if (events.current.length > MAX_EVENTS_PER_BATCH) {
      events.current = events.current.slice(-MAX_EVENTS_PER_BATCH);
    }
  }, []);
  
  // Track game state change
  const trackStateChange = useCallback(() => {
    trackEvent('gameStateChange', {
      phase: state.core.phase,
      playerCount: Object.keys(state.entities.players).length,
      currentPlayer: state.relationships.currentPlayer,
      currentTrick: state.relationships.currentTrick,
    });
  }, [state, trackEvent]);
  
  // Track player action
  const trackPlayerAction = useCallback((
    action: string,
    playerId: string,
    details: Record<string, unknown> = {}
  ) => {
    trackEvent('playerAction', {
      action,
      playerId,
      ...details,
    });
  }, [trackEvent]);
  
  // Track performance metrics
  const trackPerformanceMetrics = useCallback(() => {
    trackEvent('performanceMetrics', {
      frameRate: getFrameRate(),
      renderTime: getAverageRenderTime(),
      stateUpdateTime: getAverageStateUpdateTime(),
      networkLatency: getAverageNetworkLatency(),
      memoryUsage: getCurrentMemoryUsage(),
    });
  }, [
    getFrameRate,
    getAverageRenderTime,
    getAverageStateUpdateTime,
    getAverageNetworkLatency,
    getCurrentMemoryUsage,
    trackEvent,
  ]);
  
  // Send telemetry data
  const sendTelemetry = useCallback(async () => {
    try {
      const telemetryData: TelemetryData = {
        sessionId: sessionId.current,
        userId: 'anonymous', // TODO: Get from auth context
        timestamp: Date.now(),
        metrics: {
          frameRate: getFrameRate(),
          renderTime: getAverageRenderTime(),
          stateUpdateTime: getAverageStateUpdateTime(),
          networkLatency: getAverageNetworkLatency(),
          memoryUsage: getCurrentMemoryUsage(),
        },
        events: events.current,
      };
      
      // Send to analytics endpoint
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(telemetryData),
      });
      
      // Clear sent events
      events.current = [];
      lastTelemetryTime.current = Date.now();
    } catch (error) {
      handleError('Failed to send telemetry data', {
        showToast: true,
        playSound: true,
        logToConsole: true,
        logToServer: true,
      });
    }
  }, [
    getFrameRate,
    getAverageRenderTime,
    getAverageStateUpdateTime,
    getAverageNetworkLatency,
    getCurrentMemoryUsage,
    handleError,
  ]);
  
  // Track game phase changes
  useEffect(() => {
    trackStateChange();
  }, [state.core.phase, trackStateChange]);
  
  // Track player actions
  useEffect(() => {
    if (state.core.lastAction) {
      trackPlayerAction(state.core.lastAction, state.relationships.currentPlayer || 'system');
    }
  }, [state.core.lastAction, state.relationships.currentPlayer, trackPlayerAction]);
  
  // Send telemetry periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastTelemetryTime.current >= TELEMETRY_INTERVAL) {
        trackPerformanceMetrics();
        sendTelemetry();
      }
    }, TELEMETRY_INTERVAL);
    
    return () => clearInterval(interval);
  }, [trackPerformanceMetrics, sendTelemetry]);
  
  // Send telemetry on unmount
  useEffect(() => {
    return () => {
      trackEvent('sessionEnd', {
        duration: Date.now() - lastTelemetryTime.current,
      });
      sendTelemetry();
    };
  }, [trackEvent, sendTelemetry]);
  
  return {
    trackEvent,
    trackStateChange,
    trackPlayerAction,
    trackPerformanceMetrics,
    sendTelemetry,
  };
}; 