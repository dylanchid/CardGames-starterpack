import type { Meta, StoryObj } from '@storybook/react';
import { GameBoard } from './GameBoard';
import { z } from 'zod';
import { Suit, Rank } from '../../types/card';

// Create cards with proper structure including position and id
const createCard = (suit: Suit, rank: Rank, index: number) => ({
  id: `${suit}-${rank}-${index}`,
  suit: suit,
  rank: rank,
  isFaceUp: true,
  position: {
    x: 0,
    y: 0,
    zIndex: index
  }
});

const samplePlayers = [
  {
    id: '1',
    name: 'Player 1',
    hand: [
      createCard(Suit.HEARTS, Rank.ACE, 1),
      createCard(Suit.DIAMONDS, Rank.KING, 2),
      createCard(Suit.CLUBS, Rank.QUEEN, 3),
    ],
    bid: 3,
    tricksWon: 1,
    isActive: true,
  },
  {
    id: '2',
    name: 'Player 2',
    hand: [
      createCard(Suit.SPADES, Rank.JACK, 4),
      createCard(Suit.HEARTS, Rank.TEN, 5),
    ],
    bid: 2,
    tricksWon: 0,
    isActive: false,
  },
  {
    id: '3',
    name: 'Player 3',
    hand: [
      createCard(Suit.DIAMONDS, Rank.NINE, 6),
      createCard(Suit.CLUBS, Rank.EIGHT, 7),
      createCard(Suit.SPADES, Rank.SEVEN, 8),
    ],
    bid: 1,
    tricksWon: 2,
    isActive: false,
  },
  {
    id: '4',
    name: 'Player 4',
    hand: [
      createCard(Suit.HEARTS, Rank.SIX, 9),
      createCard(Suit.DIAMONDS, Rank.FIVE, 10),
    ],
    bid: null,
    tricksWon: 0,
    isActive: false,
  },
];

const sampleCurrentTrick = [
  { suit: Suit.HEARTS, rank: Rank.ACE, player: 0 },
  { suit: Suit.HEARTS, rank: Rank.KING, player: 1 },
];

const meta = {
  title: 'Game/GameBoard',
  component: GameBoard,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof GameBoard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    players: samplePlayers,
    currentTrick: sampleCurrentTrick,
    onCardPlay: (card) => {
      alert(`Card played: ${card.rank} of ${card.suit}`);
    },
  },
};

export const EmptyTrick: Story = {
  args: {
    players: samplePlayers,
    currentTrick: [],
    onCardPlay: (card) => {
      alert(`Card played: ${card.rank} of ${card.suit}`);
    },
  },
}; 