/**
 * @fileoverview Tests for the useRealtime hook
 */

import { renderHook, act } from '@testing-library/react';
import { useRealtime } from './useRealtime';
import { RealtimeManager } from './RealtimeManager';

// Mock functions
const mockConnect = jest.fn().mockImplementation(sessionId => {
  if (sessionId === 'error-session') {
    return Promise.reject(new Error('Connection error'));
  }
  return Promise.resolve(true);
});

const mockDisconnect = jest.fn().mockResolvedValue(undefined);
const mockSendMessage = jest.fn();
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();
const mockSetUserId = jest.fn();

// Mock the RealtimeManager class
jest.mock('./RealtimeManager', () => {
  return {
    RealtimeManager: jest.fn().mockImplementation(() => {
      return {
        connect: mockConnect,
        disconnect: mockDisconnect,
        sendMessage: mockSendMessage,
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
        setUserId: mockSetUserId,
      };
    }),
  };
});

describe('useRealtime', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useRealtime());
    
    expect(result.current.isConnected).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.sessionId).toBeNull();
    expect(result.current.connect).toBeInstanceOf(Function);
    expect(result.current.disconnect).toBeInstanceOf(Function);
    expect(result.current.sendMessage).toBeInstanceOf(Function);
    expect(result.current.addEventListener).toBeInstanceOf(Function);
    expect(result.current.removeEventListener).toBeInstanceOf(Function);
  });

  it('should set userId when provided', () => {
    const userId = 'test-user-id';
    renderHook(() => useRealtime(userId));
    
    expect(mockSetUserId).toHaveBeenCalledWith(userId);
  });

  it('should connect to a session', async () => {
    const { result } = renderHook(() => useRealtime());
    
    await act(async () => {
      await result.current.connect('test-session');
    });
    
    expect(mockConnect).toHaveBeenCalledWith('test-session');
    expect(result.current.isConnected).toBe(true);
    expect(result.current.sessionId).toBe('test-session');
  });

  it('should handle connection errors', async () => {
    const { result } = renderHook(() => useRealtime());
    
    await act(async () => {
      await result.current.connect('error-session');
    });
    
    expect(mockConnect).toHaveBeenCalledWith('error-session');
    expect(result.current.isConnected).toBe(false);
    expect(result.current.error).toBe('Connection error');
  });

  it('should disconnect from a session', async () => {
    const { result } = renderHook(() => useRealtime());
    
    // Connect first
    await act(async () => {
      await result.current.connect('test-session');
    });
    
    // Then disconnect
    await act(async () => {
      await result.current.disconnect();
    });
    
    expect(mockDisconnect).toHaveBeenCalled();
    expect(result.current.isConnected).toBe(false);
    expect(result.current.sessionId).toBeNull();
  });

  it('should send messages when connected', async () => {
    const { result } = renderHook(() => useRealtime());
    
    // Connect first
    await act(async () => {
      await result.current.connect('test-session');
    });
    
    // Send message
    act(() => {
      result.current.sendMessage('chat_message', { data: 'message' });
    });
    
    expect(mockSendMessage).toHaveBeenCalledWith('chat_message', { data: 'message' });
  });

  it('should not send messages when not connected', () => {
    const { result } = renderHook(() => useRealtime());
    
    // Try to send message without connecting
    act(() => {
      result.current.sendMessage('chat_message', { data: 'message' });
    });
    
    expect(mockSendMessage).not.toHaveBeenCalled();
  });

  it('should add event listeners', () => {
    const { result } = renderHook(() => useRealtime());
    const callback = jest.fn();
    
    act(() => {
      result.current.addEventListener('player_join', callback);
    });
    
    expect(mockAddEventListener).toHaveBeenCalledWith('player_join', callback);
  });

  it('should remove event listeners', () => {
    const { result } = renderHook(() => useRealtime());
    const callback = jest.fn();
    
    act(() => {
      result.current.removeEventListener('player_leave', callback);
    });
    
    expect(mockRemoveEventListener).toHaveBeenCalledWith('player_leave', callback);
  });

  it('should clean up on unmount', async () => {
    const { result, unmount } = renderHook(() => useRealtime());
    
    // Connect first
    await act(async () => {
      await result.current.connect('test-session');
    });
    
    // Unmount the hook
    unmount();
    
    expect(mockDisconnect).toHaveBeenCalled();
  });
}); 