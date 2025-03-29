/**
 * @fileoverview Hook for handling game testing and debugging
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useGame } from '../components/core/GameProvider';
import { useGameErrorHandling } from './useGameErrorHandling';
import { useGamePerformance } from './useGamePerformance';

interface DebugState {
  isDebugMode: boolean;
  showFPS: boolean;
  showHitboxes: boolean;
  showGrid: boolean;
  showColliders: boolean;
  showNetwork: boolean;
  showState: boolean;
  showPerformance: boolean;
  showConsole: boolean;
  showProfiler: boolean;
  showMemory: boolean;
  showNetworkLatency: boolean;
  showGameState: boolean;
  showPlayerState: boolean;
  showCardState: boolean;
  showBidState: boolean;
  showTrickState: boolean;
}

const DEFAULT_DEBUG_STATE: DebugState = {
  isDebugMode: false,
  showFPS: false,
  showHitboxes: false,
  showGrid: false,
  showColliders: false,
  showNetwork: false,
  showState: false,
  showPerformance: false,
  showConsole: false,
  showProfiler: false,
  showMemory: false,
  showNetworkLatency: false,
  showGameState: false,
  showPlayerState: false,
  showCardState: false,
  showBidState: false,
  showTrickState: false,
};

export const useGameTesting = () => {
  const { state, actions } = useGame();
  const { handleError } = useGameErrorHandling();
  const {
    getFrameRate,
    getAverageRenderTime,
    getAverageStateUpdateTime,
    getAverageNetworkLatency,
    getCurrentMemoryUsage,
  } = useGamePerformance();
  
  const [debugState, setDebugState] = useState<DebugState>(DEFAULT_DEBUG_STATE);
  const consoleRef = useRef<HTMLDivElement | null>(null);
  const profilerRef = useRef<HTMLDivElement | null>(null);
  const memoryRef = useRef<HTMLDivElement | null>(null);
  const networkRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef<HTMLDivElement | null>(null);
  
  // Toggle debug mode
  const toggleDebugMode = useCallback(() => {
    setDebugState(prev => ({
      ...prev,
      isDebugMode: !prev.isDebugMode,
    }));
  }, []);
  
  // Toggle debug feature
  const toggleDebugFeature = useCallback((feature: keyof DebugState) => {
    setDebugState(prev => ({
      ...prev,
      [feature]: !prev[feature],
    }));
  }, []);
  
  // Log to debug console
  const log = useCallback((
    message: string,
    type: 'info' | 'warn' | 'error' = 'info',
    data?: unknown
  ) => {
    if (!debugState.isDebugMode || !debugState.showConsole) return;
    
    const logEntry = document.createElement('div');
    logEntry.className = `debug-log debug-log-${type}`;
    
    const timestamp = new Date().toISOString();
    const logMessage = document.createElement('span');
    logMessage.textContent = `[${timestamp}] ${message}`;
    
    logEntry.appendChild(logMessage);
    
    if (data) {
      const dataElement = document.createElement('pre');
      dataElement.textContent = JSON.stringify(data, null, 2);
      logEntry.appendChild(dataElement);
    }
    
    consoleRef.current?.appendChild(logEntry);
    consoleRef.current?.scrollTo(0, consoleRef.current.scrollHeight);
  }, [debugState.isDebugMode, debugState.showConsole]);
  
  // Update profiler display
  const updateProfiler = useCallback(() => {
    if (!debugState.isDebugMode || !debugState.showProfiler || !profilerRef.current) return;
    
    const fps = getFrameRate();
    const renderTime = getAverageRenderTime();
    const stateUpdateTime = getAverageStateUpdateTime();
    
    profilerRef.current.innerHTML = `
      <div class="profiler-header">Performance Profiler</div>
      <div class="profiler-content">
        <div>FPS: ${fps.toFixed(1)}</div>
        <div>Render Time: ${renderTime.toFixed(2)}ms</div>
        <div>State Update Time: ${stateUpdateTime.toFixed(2)}ms</div>
      </div>
    `;
  }, [debugState.isDebugMode, debugState.showProfiler, getFrameRate, getAverageRenderTime, getAverageStateUpdateTime]);
  
  // Update memory display
  const updateMemory = useCallback(() => {
    if (!debugState.isDebugMode || !debugState.showMemory || !memoryRef.current) return;
    
    const memoryUsage = getCurrentMemoryUsage();
    const memoryMB = memoryUsage / (1024 * 1024);
    
    memoryRef.current.innerHTML = `
      <div class="memory-header">Memory Usage</div>
      <div class="memory-content">
        <div>Used: ${memoryMB.toFixed(2)} MB</div>
        <div>Total: ${(performance.memory?.totalJSHeapSize || 0 / (1024 * 1024)).toFixed(2)} MB</div>
      </div>
    `;
  }, [debugState.isDebugMode, debugState.showMemory, getCurrentMemoryUsage]);
  
  // Update network display
  const updateNetwork = useCallback(() => {
    if (!debugState.isDebugMode || !debugState.showNetwork || !networkRef.current) return;
    
    const latency = getAverageNetworkLatency();
    
    networkRef.current.innerHTML = `
      <div class="network-header">Network Status</div>
      <div class="network-content">
        <div>Latency: ${latency.toFixed(2)}ms</div>
        <div>Connection: ${navigator.onLine ? 'Online' : 'Offline'}</div>
      </div>
    `;
  }, [debugState.isDebugMode, debugState.showNetwork, getAverageNetworkLatency]);
  
  // Update state display
  const updateState = useCallback(() => {
    if (!debugState.isDebugMode || !debugState.showState || !stateRef.current) return;
    
    stateRef.current.innerHTML = `
      <div class="state-header">Game State</div>
      <div class="state-content">
        <pre>${JSON.stringify(state, null, 2)}</pre>
      </div>
    `;
  }, [debugState.isDebugMode, debugState.showState, state]);
  
  // Create debug overlay
  const createDebugOverlay = useCallback(() => {
    if (!debugState.isDebugMode) return;
    
    const overlay = document.createElement('div');
    overlay.className = 'debug-overlay';
    
    // Create console
    if (debugState.showConsole) {
      const console = document.createElement('div');
      console.className = 'debug-console';
      consoleRef.current = console;
      overlay.appendChild(console);
    }
    
    // Create profiler
    if (debugState.showProfiler) {
      const profiler = document.createElement('div');
      profiler.className = 'debug-profiler';
      profilerRef.current = profiler;
      overlay.appendChild(profiler);
    }
    
    // Create memory display
    if (debugState.showMemory) {
      const memory = document.createElement('div');
      memory.className = 'debug-memory';
      memoryRef.current = memory;
      overlay.appendChild(memory);
    }
    
    // Create network display
    if (debugState.showNetwork) {
      const network = document.createElement('div');
      network.className = 'debug-network';
      networkRef.current = network;
      overlay.appendChild(network);
    }
    
    // Create state display
    if (debugState.showState) {
      const stateDisplay = document.createElement('div');
      stateDisplay.className = 'debug-state';
      stateRef.current = stateDisplay;
      overlay.appendChild(stateDisplay);
    }
    
    document.body.appendChild(overlay);
    
    return () => {
      document.body.removeChild(overlay);
    };
  }, [debugState]);
  
  // Update debug displays
  useEffect(() => {
    const cleanup = createDebugOverlay();
    
    const interval = setInterval(() => {
      updateProfiler();
      updateMemory();
      updateNetwork();
      updateState();
    }, 1000);
    
    return () => {
      cleanup?.();
      clearInterval(interval);
    };
  }, [
    createDebugOverlay,
    updateProfiler,
    updateMemory,
    updateNetwork,
    updateState,
  ]);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F12' || (event.ctrlKey && event.shiftKey && event.key === 'I')) {
        event.preventDefault();
        toggleDebugMode();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleDebugMode]);
  
  return {
    debugState,
    toggleDebugMode,
    toggleDebugFeature,
    log,
  };
}; 