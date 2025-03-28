import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';
import { Suit, Rank } from '../../types/card';

const meta: Meta<typeof Card> = {
  title: 'Game/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    card: {
      id: '1',
      suit: Suit.SPADES,
      rank: Rank.ACE,
      isFaceUp: true,
      position: { x: 0, y: 0, zIndex: 0 }
    },
  },
};

export const RedCard: Story = {
  args: {
    card: {
      id: '2',
      suit: Suit.HEARTS,
      rank: Rank.KING,
      isFaceUp: true,
      position: { x: 0, y: 0, zIndex: 0 }
    },
  },
};

export const Selected: Story = {
  args: {
    card: {
      id: '3',
      suit: Suit.CLUBS,
      rank: Rank.QUEEN,
      isFaceUp: true,
      position: { x: 0, y: 0, zIndex: 0 }
    },
    selected: true,
  },
};

export const WithClick: Story = {
  args: {
    card: {
      id: '4',
      suit: Suit.DIAMONDS,
      rank: Rank.JACK,
      isFaceUp: true,
      position: { x: 0, y: 0, zIndex: 0 }
    },
    onClick: () => alert('Card clicked!'),
  },
}; 