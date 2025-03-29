import { CardGame, NinetyNineGameState, NinetyNinePlayer } from '../../types/game';
import { CardType } from '../../types/card';
import { Trick } from '../../../types/core/GameTypes';
import { easyStrategy } from '@/app/game/services/ai/strategies/easyStrategy';
import { mediumStrategy } from '@/app/game/services/ai/strategies/mediumStrategy';
import { hardStrategy } from '@/app/game/services/ai/strategies/hardStrategy';

export interface AIStrategy {
  makeMove: (game: CardGame | null, state: NinetyNineGameState, playerId: string, performAction: (action: string, playerId: string, payload?: any) => void) => void;
  calculateBid: (player: NinetyNinePlayer, state: NinetyNineGameState) => number;
  calculateCardPlay: (player: NinetyNinePlayer, currentTrick: Trick, state: NinetyNineGameState, game: CardGame | null) => string | null;
  determineTrickWinner: (trick: Trick, state: NinetyNineGameState, game: CardGame | null) => string | null;
}

export function getAIStrategy(level: string): AIStrategy {
  switch (level) {
    case 'easy':
      return easyStrategy;
    case 'hard':
      return hardStrategy;
    case 'medium':
    default:
      return mediumStrategy;
  }
}

export function handleAITurn(
  game: CardGame | null,
  state: NinetyNineGameState,
  playerId: string,
  performAction: (action: string, playerId: string, payload?: any) => void
) {
  const player = state.entities.players[playerId];
  if (!player?.isAI) return;

  const aiLevel = player.aiLevel || 'medium';
  const strategy = getAIStrategy(aiLevel);
  
  // Add a small delay to make AI moves feel more natural
  setTimeout(() => {
    strategy.makeMove(game, state, playerId, performAction);
  }, 1500);
} 