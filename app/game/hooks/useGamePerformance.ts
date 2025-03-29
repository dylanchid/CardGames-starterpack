/**
 * @fileoverview Hook for handling game performance monitoring
 */

import { useCallback, useEffect, useRef } from 'react';
import { useGame } from '../components/core/GameProvider';
import { useGameErrorHandling } from './useGameErrorHandling';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  timestamp: number;
  context?: Record<string, unknown>;
}

interface PerformanceThreshold {
  name: string;
  warning: number;
  error: number;
}

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

declare global {
  interface Performance {
    memory?: PerformanceMemory;
  }
}

const PERFORMANCE_THRESHOLDS: PerformanceThreshold[] = [
  { name: 'frameTime', warning: 16.67, error: 33.33 }, // 60fps, 30fps
  { name: 'renderTime', warning: 100, error: 200 }, // ms
  { name: 'stateUpdateTime', warning: 50, error: 100 }, // ms
  { name: 'networkLatency', warning: 100, error: 300 }, // ms
  { name: 'memoryUsage', warning: 100 * 1024 * 1024, error: 200 * 1024 * 1024 }, // 100MB, 200MB
];

export const useGamePerformance = () => {
  const { state } = useGame();
  const { handleError } = useGameErrorHandling();
  const metrics = useRef<PerformanceMetric[]>([]);
  const frameCount = useRef(0);
  const lastFrameTime = useRef(0);
  const renderStartTime = useRef(0);
  const stateUpdateStartTime = useRef(0);
  
  // Generate unique metric ID
  const generateMetricId = useCallback(() => {
    return Math.random().toString(36).substring(2, 15);
  }, []);
  
  // Record performance metric
  const recordMetric = useCallback((
    name: string,
    value: number,
    context?: Record<string, unknown>
  ) => {
    const metric: PerformanceMetric = {
      id: generateMetricId(),
      name,
      value,
      timestamp: Date.now(),
      context,
    };
    
    metrics.current.push(metric);
    
    // Check thresholds
    const threshold = PERFORMANCE_THRESHOLDS.find(t => t.name === name);
    if (threshold) {
      if (value >= threshold.error) {
        handleError(`Performance error: ${name} exceeded threshold (${value}ms)`, {
          showToast: true,
          logToConsole: true,
          logToServer: true,
        });
      } else if (value >= threshold.warning) {
        handleError(`Performance warning: ${name} approaching threshold (${value}ms)`, {
          showToast: true,
          logToConsole: true,
          logToServer: true,
        });
      }
    }
  }, [generateMetricId, handleError]);
  
  // Start frame timing
  const startFrame = useCallback(() => {
    const now = performance.now();
    if (lastFrameTime.current > 0) {
      const frameTime = now - lastFrameTime.current;
      recordMetric('frameTime', frameTime);
    }
    lastFrameTime.current = now;
    frameCount.current++;
  }, [recordMetric]);
  
  // Start render timing
  const startRender = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);
  
  // End render timing
  const endRender = useCallback(() => {
    const renderTime = performance.now() - renderStartTime.current;
    recordMetric('renderTime', renderTime);
  }, [recordMetric]);
  
  // Start state update timing
  const startStateUpdate = useCallback(() => {
    stateUpdateStartTime.current = performance.now();
  }, []);
  
  // End state update timing
  const endStateUpdate = useCallback(() => {
    const stateUpdateTime = performance.now() - stateUpdateStartTime.current;
    recordMetric('stateUpdateTime', stateUpdateTime);
  }, [recordMetric]);
  
  // Measure network latency
  const measureNetworkLatency = useCallback(async () => {
    const startTime = performance.now();
    try {
      const response = await fetch('/api/ping');
      const latency = performance.now() - startTime;
      recordMetric('networkLatency', latency);
    } catch (error) {
      handleError('Failed to measure network latency', {
        showToast: true,
        logToConsole: true,
        logToServer: true,
      });
    }
  }, [recordMetric, handleError]);
  
  // Measure memory usage
  const measureMemoryUsage = useCallback(() => {
    if (performance.memory) {
      const memoryUsage = performance.memory.usedJSHeapSize;
      recordMetric('memoryUsage', memoryUsage);
    }
  }, [recordMetric]);
  
  // Get performance metrics
  const getMetrics = useCallback(() => {
    return metrics.current;
  }, []);
  
  // Clear performance metrics
  const clearMetrics = useCallback(() => {
    metrics.current = [];
  }, []);
  
  // Get frame rate
  const getFrameRate = useCallback(() => {
    const now = performance.now();
    const elapsed = now - lastFrameTime.current;
    return elapsed > 0 ? 1000 / elapsed : 0;
  }, []);
  
  // Get average frame time
  const getAverageFrameTime = useCallback(() => {
    const frameTimes = metrics.current
      .filter(m => m.name === 'frameTime')
      .map(m => m.value);
    
    if (frameTimes.length === 0) return 0;
    
    return frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
  }, []);
  
  // Get average render time
  const getAverageRenderTime = useCallback(() => {
    const renderTimes = metrics.current
      .filter(m => m.name === 'renderTime')
      .map(m => m.value);
    
    if (renderTimes.length === 0) return 0;
    
    return renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
  }, []);
  
  // Get average state update time
  const getAverageStateUpdateTime = useCallback(() => {
    const stateUpdateTimes = metrics.current
      .filter(m => m.name === 'stateUpdateTime')
      .map(m => m.value);
    
    if (stateUpdateTimes.length === 0) return 0;
    
    return stateUpdateTimes.reduce((a, b) => a + b, 0) / stateUpdateTimes.length;
  }, []);
  
  // Get average network latency
  const getAverageNetworkLatency = useCallback(() => {
    const latencies = metrics.current
      .filter(m => m.name === 'networkLatency')
      .map(m => m.value);
    
    if (latencies.length === 0) return 0;
    
    return latencies.reduce((a, b) => a + b, 0) / latencies.length;
  }, []);
  
  // Get current memory usage
  const getCurrentMemoryUsage = useCallback(() => {
    if (performance.memory) {
      return performance.memory.usedJSHeapSize;
    }
    return 0;
  }, []);
  
  // Start performance monitoring
  useEffect(() => {
    let frameId: number;
    let networkInterval: NodeJS.Timeout;
    let memoryInterval: NodeJS.Timeout;
    
    // Frame timing loop
    const frameLoop = () => {
      startFrame();
      frameId = requestAnimationFrame(frameLoop);
    };
    
    // Start frame timing
    frameId = requestAnimationFrame(frameLoop);
    
    // Network latency measurement
    networkInterval = setInterval(measureNetworkLatency, 30000); // Every 30 seconds
    
    // Memory usage measurement
    memoryInterval = setInterval(measureMemoryUsage, 60000); // Every minute
    
    return () => {
      cancelAnimationFrame(frameId);
      clearInterval(networkInterval);
      clearInterval(memoryInterval);
    };
  }, [startFrame, measureNetworkLatency, measureMemoryUsage]);
  
  return {
    startFrame,
    startRender,
    endRender,
    startStateUpdate,
    endStateUpdate,
    measureNetworkLatency,
    measureMemoryUsage,
    getMetrics,
    clearMetrics,
    getFrameRate,
    getAverageFrameTime,
    getAverageRenderTime,
    getAverageStateUpdateTime,
    getAverageNetworkLatency,
    getCurrentMemoryUsage,
  };
}; 