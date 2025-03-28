import type { Meta, StoryObj } from '@storybook/react';
import { Deck } from './Deck';

const meta: Meta<typeof Deck> = {
  title: 'Game/Deck',
  component: Deck,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Deck>;

const sampleCards = [
  { suit: '♠', rank: 'A' },
  { suit: '♥', rank: 'K' },
  { suit: '♣', rank: 'Q' },
  { suit: '♦', rank: 'J' },
];

export const Default: Story = {
  args: {
    cards: sampleCards,
  },
};

export const Empty: Story = {
  args: {
    cards: [],
    isDeckEmpty: true,
  },
};

export const WithDraw: Story = {
  args: {
    cards: sampleCards,
    onDraw: () => alert('Drawing card!'),
  },
}; 