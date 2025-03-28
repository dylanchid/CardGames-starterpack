/**
 * @fileoverview Tests for game slice
 */

import { GamePhase } from '@/app/game/types/core/GameTypes';
import reducer, {
  setGamePhase,
  setGameMode,
  updateGameSettings,
  setTurnupCard,
  setCurrentPlayerIndex,
  setCurrentTrickLeader,
  setRoundNumber,
  setTricksPlayed,
  setGameStarted,
  setError,
  setLoading,
  setLastAction,
  addTrickToHistory,
  clearTrickHistory,
  startNewRound,
  finishGame,
  resetGame
} from './gameSlice';

import { initialCoreGameState } from '@/app/game/types/core/GameTypes';

describe('game slice', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(initialCoreGameState);
  });

  it('should handle setGamePhase', () => {
    const phase: GamePhase = 'bidding';
    expect(reducer(initialCoreGameState, setGamePhase(phase))).toEqual({
      ...initialCoreGameState,
      gamePhase: phase,
      lastAction: 'setGamePhase',
    });
  });

  it('should handle setRoundNumber', () => {
    const roundNumber = 2;
    expect(reducer(initialCoreGameState, setRoundNumber(roundNumber))).toEqual({
      ...initialCoreGameState,
      roundNumber,
      lastAction: 'setRoundNumber',
    });
  });

  it('should handle setTricksPlayed', () => {
    const tricksPlayed = 5;
    expect(reducer(initialCoreGameState, setTricksPlayed(tricksPlayed))).toEqual({
      ...initialCoreGameState,
      tricksPlayed,
      lastAction: 'setTricksPlayed',
    });
  });

  it('should handle setError', () => {
    const error = {
      type: 'VALIDATION' as const,
      message: 'Test error',
    };
    expect(reducer(initialCoreGameState, setError(error))).toEqual({
      ...initialCoreGameState,
      error,
      lastAction: 'setError',
    });
  });

  it('should handle startNewRound', () => {
    const state = {
      ...initialCoreGameState,
      roundNumber: 1,
      tricksPlayed: 9,
      gamePhase: 'playing' as GamePhase,
      error: {
        type: 'VALIDATION' as const,
        message: 'Test error',
      },
    };
    
    expect(reducer(state, startNewRound())).toEqual({
      ...state,
      roundNumber: 2,
      tricksPlayed: 0,
      gamePhase: 'dealing',
      currentPlayerIndex: 0,
      currentTrickLeader: 0,
      error: null,
      lastAction: 'startNewRound',
    });
  });

  it('should handle finishGame', () => {
    expect(reducer(initialCoreGameState, finishGame())).toEqual({
      ...initialCoreGameState,
      gamePhase: 'scoring',
      lastAction: 'finishGame',
    });
  });

  it('should handle resetGame', () => {
    const state = {
      ...initialCoreGameState,
      roundNumber: 3,
      tricksPlayed: 7,
      gamePhase: 'scoring' as GamePhase,
    };
    
    expect(reducer(state, resetGame())).toEqual(initialCoreGameState);
  });
}); 