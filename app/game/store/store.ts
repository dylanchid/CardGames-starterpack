/**
 * @fileoverview Redux store configuration
 */

import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Import reducers
import { 
  gameReducer, 
  playerReducer, 
  biddingReducer, 
  cardPlayReducer,
  cardReducer,
  uiReducer
} from './slices';

// Configure the store
export const store = configureStore({
  reducer: {
    game: gameReducer,
    player: playerReducer,
    bidding: biddingReducer,
    cardPlay: cardPlayReducer,
    card: cardReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the state
        ignoredActions: ['payload.error', 'meta.arg'],
        ignoredActionPaths: ['payload.error', 'meta.arg'],
        ignoredPaths: ['game.error.details'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Type-safe hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Typed thunk
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>; 