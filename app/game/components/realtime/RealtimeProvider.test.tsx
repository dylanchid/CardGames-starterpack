/**
 * @fileoverview Tests for the RealtimeProvider component
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { RealtimeProvider } from './RealtimeProvider';
import * as useRealtime from '@/app/lib/realtime/useRealtime';
import gameReducer from '@/app/game/store/slices/game/gameSlice';
import playersReducer from '@/app/game/store/slices/players/playersSlice';

// Mock the useRealtime hook
jest.mock('@/app/lib/realtime/useRealtime', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock GameSync
jest.mock('@/app/lib/realtime/GameSync', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      setSessionId: jest.fn(),
      sendFullSync: jest.fn(),
    })),
  };
});

describe('RealtimeProvider', () => {
  // Setup store for tests
  const store = configureStore({
    reducer: {
      game: gameReducer,
      players: playersReducer,
    },
  });

  // Mock useRealtime return values
  const mockUseRealtime = {
    isConnected: false,
    connect: jest.fn(),
    disconnect: jest.fn(),
    error: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    sendMessage: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRealtime.default as jest.Mock).mockReturnValue(mockUseRealtime);
  });

  it('should show connecting status when not connected', () => {
    render(
      <Provider store={store}>
        <RealtimeProvider sessionId="test-session" userId="user1">
          <div>Child Component</div>
        </RealtimeProvider>
      </Provider>
    );

    expect(screen.getByText('Connecting to game...')).toBeInTheDocument();
    expect(mockUseRealtime.connect).toHaveBeenCalledWith('test-session');
  });

  it('should show error when connection fails', () => {
    const errorMock = { message: 'Connection failed' };
    (useRealtime.default as jest.Mock).mockReturnValue({
      ...mockUseRealtime,
      error: errorMock,
    });

    render(
      <Provider store={store}>
        <RealtimeProvider sessionId="test-session" userId="user1">
          <div>Child Component</div>
        </RealtimeProvider>
      </Provider>
    );

    expect(screen.getByText('Error: Connection failed')).toBeInTheDocument();
    expect(screen.getByText('Reconnect')).toBeInTheDocument();
  });

  it('should render children when connected', () => {
    (useRealtime.default as jest.Mock).mockReturnValue({
      ...mockUseRealtime,
      isConnected: true,
    });

    render(
      <Provider store={store}>
        <RealtimeProvider sessionId="test-session" userId="user1">
          <div>Child Component</div>
        </RealtimeProvider>
      </Provider>
    );

    expect(screen.getByText('Child Component')).toBeInTheDocument();
    expect(screen.queryByText('Connecting to game...')).not.toBeInTheDocument();
  });

  it('should attempt to reconnect when reconnect button is clicked', () => {
    const errorMock = { message: 'Connection failed' };
    (useRealtime.default as jest.Mock).mockReturnValue({
      ...mockUseRealtime,
      error: errorMock,
    });

    render(
      <Provider store={store}>
        <RealtimeProvider sessionId="test-session" userId="user1">
          <div>Child Component</div>
        </RealtimeProvider>
      </Provider>
    );

    const reconnectButton = screen.getByText('Reconnect');
    act(() => {
      reconnectButton.click();
    });

    expect(mockUseRealtime.connect).toHaveBeenCalledTimes(2);
    expect(mockUseRealtime.connect).toHaveBeenCalledWith('test-session');
  });
}); 