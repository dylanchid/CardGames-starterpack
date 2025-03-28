import type { Meta, StoryObj } from '@storybook/react';
import { Player } from './Player';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Suit, Rank } from '../../types/card';

const CardSchema = z.object({
  id: z.string(),
  suit: z.nativeEnum(Suit),
  rank: z.nativeEnum(Rank),
  isFaceUp: z.boolean(),
  position: z.object({
    x: z.number(),
    y: z.number(),
    zIndex: z.number(),
  }),
});

type CardType = z.infer<typeof CardSchema>;

const meta: Meta<typeof Player> = {
  title: 'Game/Player',
  component: Player,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Player>;

const sampleHand: CardType[] = [
  { 
    id: uuidv4(), 
    suit: Suit.SPADES, 
    rank: Rank.ACE, 
    isFaceUp: true, 
    position: { x: 0, y: 0, zIndex: 0 } 
  },
  { 
    id: uuidv4(), 
    suit: Suit.HEARTS, 
    rank: Rank.KING, 
    isFaceUp: true, 
    position: { x: 30, y: 0, zIndex: 1 } 
  },
  { 
    id: uuidv4(), 
    suit: Suit.CLUBS, 
    rank: Rank.QUEEN, 
    isFaceUp: true, 
    position: { x: 60, y: 0, zIndex: 2 } 
  },
  { 
    id: uuidv4(), 
    suit: Suit.DIAMONDS, 
    rank: Rank.JACK, 
    isFaceUp: true, 
    position: { x: 90, y: 0, zIndex: 3 } 
  },
  { 
    id: uuidv4(), 
    suit: Suit.SPADES, 
    rank: Rank.TEN, 
    isFaceUp: true, 
    position: { x: 120, y: 0, zIndex: 4 } 
  },
];

export const Default: Story = {
  args: {
    id: '1',
    name: 'Player 1',
    hand: sampleHand,
    bid: null,
    tricksWon: 0,
    isActive: false,
  },
};

export const Active: Story = {
  args: {
    id: '2',
    name: 'Player 2',
    hand: sampleHand,
    bid: 3,
    tricksWon: 2,
    isActive: true,
  },
};

export const WithCardClick: Story = {
  args: {
    id: '3',
    name: 'Player 3',
    hand: sampleHand,
    bid: 2,
    tricksWon: 1,
    isActive: false,
    onCardClick: (card) => alert(`Clicked card: ${card.rank} of ${card.suit}`),
  },
}; 