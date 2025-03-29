import { GamePhase, GameSettings, Player as PlayerExternal, Trick as TrickExternal, Bid as BidExternal, GameState as GameStateExternal, GameError as GameErrorExternal } from '../../../types/core/GameTypes';
import { GamePhase as GamePhaseInternal, GameSettings as GameSettingsInternal, Player as PlayerInternal, Trick as TrickInternal, Bid as BidInternal, GameError as GameErrorInternal } from './GameTypes';
import { GameState as GameStateInternal } from './GameTypes';
import { NinetyNineGameState, NinetyNinePlayer } from '../game';
import { Suit } from '../card';
import { StackType as GameStackType } from '../card';
import { StackType as CoreStackType } from '../../../types/core/StackTypes';

export const adaptGamePhase = (phase: GamePhase): GamePhaseInternal => phase as GamePhaseInternal;
export const adaptGamePhaseReverse = (phase: GamePhaseInternal): GamePhase => phase as GamePhase;

export const adaptGameSettings = (settings: GameSettingsInternal): GameSettings => ({
  maxPlayers: settings.maxPlayers,
  minPlayers: settings.minPlayers,
  maxRounds: settings.maxRounds,
  maxTricks: settings.maxTricks,
  cardsPerPlayer: settings.cardsPerPlayer,
  roundTimeLimit: settings.roundTimeLimit,
  trickTimeLimit: settings.trickTimeLimit,
  timeLimit: settings.timeLimit,
  allowUndo: settings.allowUndo,
  allowRedo: settings.allowRedo,
  autoPlay: settings.autoPlay,
  soundEnabled: settings.soundEnabled,
  animationsEnabled: settings.animationsEnabled,
  allowTrump: settings.allowTrump,
  allowNoTrump: settings.allowNoTrump,
  allowPartnership: settings.allowPartnership,
  scoringSystem: settings.scoringSystem,
  mode: settings.mode
});

export const adaptGameSettingsReverse = (settings: GameSettings): GameSettingsInternal => ({
  maxPlayers: settings.maxPlayers,
  minPlayers: settings.minPlayers,
  maxRounds: settings.maxRounds,
  maxTricks: settings.maxTricks,
  cardsPerPlayer: settings.cardsPerPlayer,
  roundTimeLimit: settings.roundTimeLimit,
  trickTimeLimit: settings.trickTimeLimit,
  timeLimit: settings.timeLimit,
  allowUndo: settings.allowUndo,
  allowRedo: settings.allowRedo,
  autoPlay: settings.autoPlay,
  soundEnabled: settings.soundEnabled,
  animationsEnabled: settings.animationsEnabled,
  allowTrump: settings.allowTrump,
  allowNoTrump: settings.allowNoTrump,
  allowPartnership: settings.allowPartnership,
  scoringSystem: settings.scoringSystem,
  mode: settings.mode
});

export const adaptPlayer = (player: PlayerInternal): PlayerExternal => {
  return {
    id: player.id,
    name: player.name,
    isAI: player.isAI || false,
    score: player.score,
    hand: player.hand || [],
    tricks: player.tricks || [],
    bids: player.bids || [],
    isReady: player.isReady || false
  };
};

export const adaptPlayerReverse = (player: PlayerExternal): PlayerInternal => {
  return {
    id: player.id,
    name: player.name,
    hand: player.hand || [],
    bids: player.bids || [],
    tricks: player.tricks || [],
    score: player.score,
    isAI: player.isAI || false,
    isReady: player.isReady || false
  };
};

export const adaptTrick = (trick: TrickExternal): TrickInternal => {
  return {
    id: trick.id,
    cards: trick.cards,
    winnerId: trick.winnerId,
    leadSuit: null,
    leadPlayerId: trick.leaderId,
    complete: true
  };
};

export const adaptTrickReverse = (trick: TrickInternal): TrickExternal => {
  return {
    id: trick.id,
    leaderId: trick.leadPlayerId,
    cards: trick.cards,
    winnerId: trick.winnerId || '',
    timestamp: Date.now(),
    roundNumber: 0 // This needs to be determined from the game state
  };
};

export const adaptBid = (bid: BidExternal): BidInternal => {
  return {
    id: bid.id,
    playerId: bid.playerId,
    cardIds: [], // This needs to be determined from the game state
    timestamp: bid.timestamp,
    isRevealed: bid.isRevealed,
    value: 0,
    roundNumber: 0
  };
};

export const adaptBidReverse = (bid: BidInternal): BidExternal => {
  return {
    id: bid.id,
    playerId: bid.playerId,
    cardIds: bid.cardIds,
    value: bid.cardIds.length,
    timestamp: bid.timestamp,
    roundNumber: 0, // This needs to be determined from the game state
    isRevealed: bid.isRevealed
  };
};

export const adaptGameError = (error: GameErrorExternal): GameErrorInternal => {
  return {
    type: 'GAME_STATE',
    message: error.message,
    details: error.details
  };
};

export const adaptGameErrorReverse = (error: GameErrorInternal): GameErrorExternal => {
  return {
    code: error.type,
    message: error.message,
    details: error.details
  };
};

export const adaptStack = (stack: CoreStackType): GameStackType => {
  const type = stack.type === 'trick' ? 'table' : stack.type;
  
  return {
    id: stack.id,
    type,
    cards: stack.cards,
    position: stack.position ? {
      x: stack.position.x,
      y: stack.position.y,
      zIndex: 1,
      rotation: stack.position.rotation
    } : { x: 0, y: 0, zIndex: 1, rotation: 0 },
    isFaceUp: stack.isFaceUp,
    owner: stack.ownerId,
    isLoading: stack.isLoading,
    error: stack.error,
    cardCount: stack.cardCount,
    topCard: stack.topCard,
    bottomCard: stack.bottomCard,
    isEmpty: stack.isEmpty,
    isFull: stack.isFull,
    hasFaceUpCards: stack.hasFaceUpCards,
    hasFaceDownCards: stack.hasFaceDownCards
  };
};

export const adaptStackReverse = (stack: GameStackType): CoreStackType => {
  const type = stack.type === 'table' ? 'trick' : stack.type;
  
  return {
    id: stack.id,
    type,
    cardIds: stack.cards.map(card => card.id),
    ownerId: stack.owner,
    position: {
      x: stack.position.x,
      y: stack.position.y,
      rotation: stack.position.rotation || 0
    },
    cards: stack.cards,
    isFaceUp: stack.isFaceUp,
    cardCount: stack.cardCount,
    topCard: stack.topCard,
    bottomCard: stack.bottomCard,
    isEmpty: stack.isEmpty,
    isFull: stack.isFull,
    hasFaceUpCards: stack.hasFaceUpCards,
    hasFaceDownCards: stack.hasFaceDownCards,
    isLoading: stack.isLoading,
    error: stack.error
  };
};

export const adaptGameState = (state: GameStateExternal): GameStateInternal => {
  return {
    core: {
      phase: adaptGamePhase(state.core.phase),
      roundNumber: state.core.roundNumber,
      turnupCardId: state.core.turnupCardId,
      settings: adaptGameSettingsReverse(state.core.settings),
      error: state.core.error,
      lastAction: state.core.lastAction,
      lastActionTimestamp: state.core.lastActionTimestamp
    },
    entities: {
      players: Object.entries(state.entities.players).reduce((acc, [id, player]) => {
        acc[id] = adaptPlayerReverse(player);
        return acc;
      }, {} as Record<string, PlayerInternal>),
      cards: state.entities.cards,
      tricks: Object.entries(state.entities.tricks).reduce((acc, [id, trick]) => {
        acc[id] = adaptTrick(trick);
        return acc;
      }, {} as Record<string, TrickInternal>),
      bids: Object.entries(state.entities.bids).reduce((acc, [id, bid]) => {
        acc[id] = adaptBid(bid);
        return acc;
      }, {} as Record<string, BidInternal>),
      stacks: Object.entries(state.entities.stacks).reduce((acc, [id, stack]) => {
        acc[id] = adaptStack(stack);
        return acc;
      }, {} as Record<string, GameStackType>)
    },
    relationships: {
      playerOrder: state.relationships.playerOrder,
      currentTrick: state.relationships.currentTrick,
      currentPlayer: state.relationships.currentPlayer,
      currentBidder: state.relationships.currentBidder
    },
    ui: {
      selectedCards: state.ui.selectedCards,
      draggedCard: state.ui.draggedCard,
      isAnimating: state.ui.animationState.isAnimating,
      currentAnimation: state.ui.animationState.currentAnimation,
      animationQueue: state.ui.animationState.animationQueue
    }
  };
};

export const adaptGameStateReverse = (state: GameStateInternal): GameStateExternal => {
  return {
    core: {
      phase: adaptGamePhaseReverse(state.core.phase),
      roundNumber: state.core.roundNumber,
      turnupCardId: state.core.turnupCardId,
      settings: adaptGameSettings(state.core.settings),
      error: state.core.error,
      lastAction: state.core.lastAction,
      lastActionTimestamp: state.core.lastActionTimestamp
    },
    entities: {
      players: Object.entries(state.entities.players).reduce((acc, [id, player]) => {
        acc[id] = adaptPlayer(player);
        return acc;
      }, {} as Record<string, PlayerExternal>),
      cards: state.entities.cards,
      tricks: Object.entries(state.entities.tricks).reduce((acc, [id, trick]) => {
        acc[id] = adaptTrickReverse(trick);
        return acc;
      }, {} as Record<string, TrickExternal>),
      bids: Object.entries(state.entities.bids).reduce((acc, [id, bid]) => {
        acc[id] = adaptBidReverse(bid);
        return acc;
      }, {} as Record<string, BidExternal>),
      stacks: Object.entries(state.entities.stacks).reduce((acc, [id, stack]) => {
        acc[id] = adaptStackReverse(stack);
        return acc;
      }, {} as Record<string, CoreStackType>)
    },
    relationships: {
      playerOrder: state.relationships.playerOrder,
      currentTrick: state.relationships.currentTrick,
      currentPlayer: state.relationships.currentPlayer,
      currentBidder: state.relationships.currentBidder
    },
    ui: {
      selectedCards: state.ui.selectedCards,
      draggedCard: state.ui.draggedCard,
      animationState: {
        isAnimating: state.ui.isAnimating,
        currentAnimation: state.ui.currentAnimation,
        animationQueue: state.ui.animationQueue
      }
    }
  };
};

export const adaptToNinetyNineState = (state: GameStateExternal): NinetyNineGameState => {
  return {
    entities: {
      players: Object.entries(state.entities.players).reduce((acc, [id, player]) => {
        acc[id] = {
          id: player.id,
          name: player.name,
          handIds: player.hand,
          bidCardIds: player.bids,
          revealBid: false,
          tricksWon: player.tricks.length,
          score: player.score,
          isActive: true,
          hasDeclaration: false,
          isAI: player.isAI
        };
        return acc;
      }, {} as Record<string, NinetyNinePlayer>),
      cards: state.entities.cards
    },
    playerIds: state.relationships.playerOrder,
    deckIds: [], // This needs to be determined from the game state
    turnupCardId: null, // This needs to be determined from the game state
    gamePhase: state.core.phase as 'bidding' | 'playing' | 'scoring',
    currentPlayerIndex: state.relationships.playerOrder.indexOf(state.relationships.currentPlayer || ''),
    currentTrickCardIds: [], // This needs to be determined from the current trick
    currentTrickSuit: null, // This needs to be determined from the current trick
    currentTrickWinner: null, // This needs to be determined from the current trick
    currentTrickLeader: 0, // This needs to be determined from the current trick
    tricksPlayed: Object.keys(state.entities.tricks).length,
    isLoading: false,
    error: state.core.error,
    lastAction: state.core.lastAction,
    gameStarted: state.core.phase !== 'setup',
    roundNumber: 0, // This needs to be determined from the game state
    gameMode: 'local',
    hasAI: Object.values(state.entities.players).some(p => p.isAI),
    lastTricks: [],
    trumpSuit: null,
    gameSettings: {
      maxRounds: state.core.settings.maxRounds,
      maxTricks: state.core.settings.maxTricks,
      cardsPerPlayer: state.core.settings.cardsPerPlayer,
      allowTrump: state.core.settings.allowTrump,
      allowNoTrump: state.core.settings.allowNoTrump,
      allowPartnership: state.core.settings.allowPartnership,
      scoringSystem: state.core.settings.scoringSystem,
      timeLimit: state.core.settings.timeLimit,
      autoPlay: state.core.settings.autoPlay
    }
  };
};

export const adaptPlayerToNinetyNine = (player: PlayerExternal): NinetyNinePlayer => {
  return {
    id: player.id,
    name: player.name,
    handIds: player.hand,
    bidCardIds: player.bids,
    revealBid: false,
    tricksWon: player.tricks.length,
    score: player.score,
    isActive: true,
    hasDeclaration: false,
    isAI: player.isAI
  };
};

export const adaptNinetyNineToPlayer = (player: NinetyNinePlayer): PlayerExternal => {
  return {
    id: player.id,
    name: player.name,
    isAI: player.isAI || false,
    score: player.score,
    hand: player.handIds,
    tricks: Array(player.tricksWon).fill(''), // Empty strings as placeholders for trick IDs
    bids: player.bidCardIds,
    isReady: true
  };
}; 