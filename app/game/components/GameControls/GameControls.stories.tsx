import type { Meta, StoryObj } from '@storybook/react';
import { GameControls } from './GameControls';

const meta: Meta<typeof GameControls> = {
  title: 'Game/GameControls',
  component: GameControls,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof GameControls>;

export const Initial: Story = {
  args: {
    isBidding: false,
    isPlaying: false,
    currentBid: null,
  },
};

export const Bidding: Story = {
  args: {
    isBidding: true,
    isPlaying: false,
    currentBid: null,
    onBid: (bid) => alert(`Bidding ${bid}`),
  },
};

export const BiddingWithCurrentBid: Story = {
  args: {
    isBidding: true,
    isPlaying: false,
    currentBid: 3,
    onBid: (bid) => alert(`Bidding ${bid}`),
  },
};

export const Playing: Story = {
  args: {
    isBidding: false,
    isPlaying: true,
    currentBid: 3,
    onEndGame: () => alert('Ending game'),
  },
}; 