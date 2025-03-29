/**
 * @fileoverview Hook for handling game error handling and logging
 */

import { useCallback, useEffect, useRef } from 'react';
import { useGame } from '../components/core/GameProvider';
import { useGameAudio } from './useGameAudio';
import { useGameAccessibility } from './useGameAccessibility';

interface ErrorLog {
  id: string;
  timestamp: number;
  type: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
}

interface ErrorHandlingOptions {
  showToast?: boolean;
  playSound?: boolean;
  logToConsole?: boolean;
  logToServer?: boolean;
  retry?: boolean;
  maxRetries?: number;
}

const DEFAULT_ERROR_OPTIONS: ErrorHandlingOptions = {
  showToast: true,
  playSound: true,
  logToConsole: true,
  logToServer: true,
  retry: false,
  maxRetries: 3,
};

export const useGameErrorHandling = () => {
  const { state, actions } = useGame();
  const { playSoundEffect } = useGameAudio();
  const { announceStateChange } = useGameAccessibility();
  const errorLogs = useRef<ErrorLog[]>([]);
  const retryCount = useRef<Record<string, number>>({});
  
  // Generate unique error ID
  const generateErrorId = useCallback(() => {
    return Math.random().toString(36).substring(2, 15);
  }, []);
  
  // Format error message
  const formatErrorMessage = useCallback((error: Error | string, context?: Record<string, unknown>): string => {
    if (typeof error === 'string') {
      return error;
    }
    
    let message = error.message;
    if (context) {
      message += `\nContext: ${JSON.stringify(context, null, 2)}`;
    }
    
    return message;
  }, []);
  
  // Log error to console
  const logToConsole = useCallback((error: Error | string, type: ErrorLog['type'], context?: Record<string, unknown>) => {
    const message = formatErrorMessage(error, context);
    
    switch (type) {
      case 'error':
        console.error(message);
        break;
      case 'warning':
        console.warn(message);
        break;
      case 'info':
        console.info(message);
        break;
    }
  }, [formatErrorMessage]);
  
  // Log error to server
  const logToServer = useCallback(async (error: Error | string, type: ErrorLog['type'], context?: Record<string, unknown>) => {
    try {
      const errorLog: ErrorLog = {
        id: generateErrorId(),
        timestamp: Date.now(),
        type,
        message: formatErrorMessage(error, context),
        stack: error instanceof Error ? error.stack : undefined,
        context,
      };
      
      // Add to local logs
      errorLogs.current.push(errorLog);
      
      // Send to server
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorLog),
      });
    } catch (serverError) {
      console.error('Failed to log error to server:', serverError);
    }
  }, [generateErrorId, formatErrorMessage]);
  
  // Show error toast
  const showErrorToast = useCallback((message: string, type: ErrorLog['type']) => {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `game-toast game-toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.textContent = message;
    
    // Add to document
    document.body.appendChild(toast);
    
    // Remove after delay
    setTimeout(() => {
      toast.remove();
    }, 5000);
  }, []);
  
  // Handle error with retry
  const handleErrorWithRetry = useCallback(async (
    error: unknown,
    operation: () => Promise<void>,
    options: ErrorHandlingOptions = {}
  ) => {
    const errorId = generateErrorId();
    const maxRetries = options.maxRetries || DEFAULT_ERROR_OPTIONS.maxRetries || 3;
    
    if (retryCount.current[errorId] >= maxRetries) {
      handleError(error instanceof Error ? error : new Error(String(error)), { ...options, retry: false });
      return;
    }
    
    retryCount.current[errorId] = (retryCount.current[errorId] || 0) + 1;
    
    try {
      await operation();
      delete retryCount.current[errorId];
    } catch (retryError) {
      handleErrorWithRetry(retryError, operation, options);
    }
  }, []);
  
  // Main error handling function
  const handleError = useCallback((
    error: unknown,
    options: ErrorHandlingOptions = {}
  ) => {
    const {
      showToast = true,
      playSound = true,
      logToConsole = true,
      logToServer = true,
    } = { ...DEFAULT_ERROR_OPTIONS, ...options };
    
    // Convert unknown error to Error | string
    const formattedError = error instanceof Error ? error : String(error);
    const message = error instanceof Error ? error.message : String(error);
    const type = formattedError instanceof Error ? 'error' : 'warning';
    
    // Log error
    if (logToConsole) {
      console.error(formattedError);
    }
    
    if (logToServer) {
      // Add to error logs
      errorLogs.current.push({
        id: generateErrorId(),
        timestamp: Date.now(),
        type,
        message: formattedError instanceof Error ? formattedError.message : formattedError,
        stack: formattedError instanceof Error ? formattedError.stack : undefined,
      });
    }
    
    // Show toast
    if (showToast) {
      showErrorToast(message, type);
    }
    
    // Play sound
    if (playSound) {
      playSoundEffect('error');
    }
    
    // Announce to screen reader
    announceStateChange(message);
    
    // Update game state
    actions.setError(message);
  }, [
    formatErrorMessage,
    logToConsole,
    logToServer,
    showErrorToast,
    playSoundEffect,
    announceStateChange,
    actions,
  ]);
  
  // Clear error
  const clearError = useCallback(() => {
    actions.setError(null);
  }, [actions]);
  
  // Get error logs
  const getErrorLogs = useCallback(() => {
    return errorLogs.current;
  }, []);
  
  // Clear error logs
  const clearErrorLogs = useCallback(() => {
    errorLogs.current = [];
  }, []);
  
  // Effect to handle unhandled errors
  useEffect(() => {
    const handleUnhandledError = (event: ErrorEvent) => {
      handleError(event.error, {
        showToast: true,
        playSound: true,
        logToConsole: true,
        logToServer: true,
      });
    };
    
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      handleError(event.reason, {
        showToast: true,
        playSound: true,
        logToConsole: true,
        logToServer: true,
      });
    };
    
    window.addEventListener('error', handleUnhandledError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleUnhandledError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [handleError]);
  
  return {
    handleError,
    handleErrorWithRetry,
    clearError,
    getErrorLogs,
    clearErrorLogs,
  };
}; 