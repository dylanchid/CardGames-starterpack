/**
 * @fileoverview Redux slice for managing player state
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Player, PlayerState, initialPlayerState, PlayerUpdates, CreatePlayerPayload } from '../../../types/core/PlayerTypes';
import { initializeGame } from '../../gameThunks';

const playerSlice = createSlice({
  name: 'player',
  initialState: initialPlayerState,
  reducers: {
    /**
     * Add a player to the game
     */
    addPlayer: (state, action: PayloadAction<CreatePlayerPayload>) => {
      const { name, id = crypto.randomUUID() } = action.payload;
      const newPlayer: Player = {
        id,
        name,
        handIds: [],
        bidCardIds: [],
        revealBid: false,
        tricksWon: 0,
        score: 0,
        isActive: true,
      };
      
      state.entities[id] = newPlayer;
      state.ids.push(id);
    },
    
    /**
     * Remove a player from the game
     */
    removePlayer: (state, action: PayloadAction<string>) => {
      const playerId = action.payload;
      delete state.entities[playerId];
      state.ids = state.ids.filter(id => id !== playerId);
    },
    
    /**
     * Update a player's properties
     */
    updatePlayer: (state, action: PayloadAction<{ id: string; changes: Partial<Player> }>) => {
      const { id, changes } = action.payload;
      if (state.entities[id]) {
        state.entities[id] = { ...state.entities[id], ...changes };
      }
    },
    
    /**
     * Set multiple players at once
     */
    setPlayers: (state, action: PayloadAction<Player[]>) => {
      const players = action.payload;
      state.ids = players.map(player => player.id);
      state.entities = players.reduce((acc, player) => ({
        ...acc,
        [player.id]: player,
      }), {});
    },
    
    /**
     * Batch update players
     */
    batchUpdatePlayers: (state, action: PayloadAction<PlayerUpdates>) => {
      const updates = action.payload;
      Object.entries(updates).forEach(([playerId, update]) => {
        if (state.entities[playerId]) {
          state.entities[playerId] = { ...state.entities[playerId], ...update };
        }
      });
    },
    
    /**
     * Add a card to a player's hand
     */
    addCardToHand: (state, action: PayloadAction<{ playerId: string; cardId: string }>) => {
      const { playerId, cardId } = action.payload;
      if (state.entities[playerId]) {
        state.entities[playerId].handIds.push(cardId);
      }
    },
    
    /**
     * Remove a card from a player's hand
     */
    removeCardFromHand: (state, action: PayloadAction<{ playerId: string; cardId: string }>) => {
      const { playerId, cardId } = action.payload;
      if (state.entities[playerId]) {
        state.entities[playerId].handIds = state.entities[playerId].handIds.filter(id => id !== cardId);
      }
    },
    
    /**
     * Update a player's trick count
     */
    updateTricksWon: (state, action: PayloadAction<{ playerId: string; tricksWon: number }>) => {
      const { playerId, tricksWon } = action.payload;
      if (state.entities[playerId]) {
        state.entities[playerId].tricksWon = tricksWon;
      }
    },
    
    /**
     * Update a player's score
     */
    updateScore: (state, action: PayloadAction<{ playerId: string; score: number }>) => {
      const { playerId, score } = action.payload;
      if (state.entities[playerId]) {
        state.entities[playerId].score = score;
      }
    },
    
    /**
     * Set bid cards for a player
     */
    setBidCards: (state, action: PayloadAction<{ playerId: string; cardIds: string[] }>) => {
      const { playerId, cardIds } = action.payload;
      if (state.entities[playerId]) {
        state.entities[playerId].bidCardIds = cardIds;
      }
    },
    
    /**
     * Toggle bid reveal for a player
     */
    toggleRevealBid: (state, action: PayloadAction<string>) => {
      const playerId = action.payload;
      if (state.entities[playerId]) {
        state.entities[playerId].revealBid = !state.entities[playerId].revealBid;
      }
    },
    
    /**
     * Reset all player state for a new round
     */
    resetPlayersForNewRound: (state) => {
      Object.values(state.entities).forEach(player => {
        player.handIds = [];
        player.bidCardIds = [];
        player.revealBid = false;
        player.tricksWon = 0;
      });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(initializeGame.fulfilled, (state, action) => {
      const players = action.payload.players;
      state.ids = players.map(p => p.id);
      state.entities = players.reduce((acc, player) => ({
        ...acc,
        [player.id]: player,
      }), {});
      
      // Update player hands
      players.forEach((player, index) => {
        if (action.payload.hands && action.payload.hands[index]) {
          // Use type assertion to resolve the type issue
          const playerEntity = state.entities[player.id];
          if (playerEntity) {
            playerEntity.handIds = action.payload.hands[index].map((card: { id: string }) => card.id);
          }
        }
      });
    });
  },
});

export const {
  addPlayer,
  removePlayer,
  updatePlayer,
  setPlayers,
  batchUpdatePlayers,
  addCardToHand,
  removeCardFromHand,
  updateTricksWon,
  updateScore,
  setBidCards,
  toggleRevealBid,
  resetPlayersForNewRound,
} = playerSlice.actions;

export default playerSlice.reducer; 