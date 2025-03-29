/**
 * @fileoverview Redux store configuration
 */

import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import gameReducer from './slices/game/gameSlice';
import cardPlayReducer from './slices/cardPlay/cardPlaySlice';
import biddingReducer from './slices/bidding/biddingSlice';
import playerReducer from './slices/player/playerSlice';
import { GameState } from '../types/core/GameTypes';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    cardPlay: cardPlayReducer,
    bidding: biddingReducer,
    player: playerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['game/setAnimationState'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 