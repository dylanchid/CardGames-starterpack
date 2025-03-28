import React from 'react';
import { Card } from '../../components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Game Rules | Ninety-Nine Card Game',
  description: 'Learn how to play the Ninety-Nine card game, a strategic trick-taking game of bidding and playing.',
};

export default function RulesPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Rules of Ninety-Nine</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card className="p-6 shadow">
            <h2 className="text-2xl font-semibold mb-4">Game Overview</h2>
            <p className="mb-4">
              Ninety-Nine is a strategic trick-taking card game where players must bid on the number of tricks they expect to win, then try to match their bid exactly.
            </p>
            <p>
              The game combines elements of strategy, memory, and psychological play as you try to accurately predict your hand's strength while watching what other players are doing.
            </p>
          </Card>
          
          <Card className="p-6 shadow">
            <h2 className="text-2xl font-semibold mb-4">Game Setup</h2>
            <ul className="list-disc pl-5 space-y-3">
              <li>
                <strong>Players:</strong> 3-6 players (4 is optimal)
              </li>
              <li>
                <strong>Cards:</strong> Standard 52-card deck
              </li>
              <li>
                <strong>Deal:</strong> Each player receives 13 cards in a four-player game (adjust for different player counts)
              </li>
              <li>
                <strong>Trump:</strong> The dealer turns up one card to determine the trump suit for the round
              </li>
            </ul>
          </Card>
          
          <Card className="p-6 shadow">
            <h2 className="text-2xl font-semibold mb-4">Gameplay</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium mb-2">1. Bidding Phase</h3>
                <p>
                  Each player secretly places a bid indicating how many tricks they believe they will win in the round. Bids are revealed simultaneously after everyone has decided.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-medium mb-2">2. Playing Phase</h3>
                <p className="mb-2">
                  Starting with the player to the dealer's left, each player plays one card to the "trick." Play proceeds clockwise.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Players must follow suit if they can</li>
                  <li>If a player cannot follow suit, they may play any card</li>
                  <li>A trump card beats any card of another suit</li>
                  <li>If no trump is played, the highest card of the led suit wins the trick</li>
                  <li>The winner of each trick leads the next trick</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-medium mb-2">3. Scoring Phase</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Exact bid:</strong> 10 points + (bid × 1 point)</li>
                  <li><strong>Missed bid:</strong> -5 points per trick over or under the bid</li>
                  <li><strong>Zero bid:</strong> 15 points if successful, -15 points if even one trick is taken</li>
                </ul>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 shadow">
            <h2 className="text-2xl font-semibold mb-4">Strategy Tips</h2>
            <ul className="list-disc pl-5 space-y-3">
              <li>
                <strong>Card Counting:</strong> Keep track of cards played, especially high cards and trumps
              </li>
              <li>
                <strong>Bid Awareness:</strong> Pay attention to other players' bids and adjust your strategy accordingly
              </li>
              <li>
                <strong>Trump Management:</strong> Use trump cards strategically to win critical tricks
              </li>
              <li>
                <strong>Void Creation:</strong> Create voids in suits to play trumps when you cannot follow suit
              </li>
              <li>
                <strong>Control Play:</strong> Win tricks early if you need to control the lead, or avoid winning if you've reached your bid target
              </li>
            </ul>
          </Card>
          
          <Card className="p-6 shadow">
            <h2 className="text-2xl font-semibold mb-4">Game End</h2>
            <p className="mb-3">
              The game typically continues for a set number of rounds or until a player reaches a predetermined score (often 99 points, hence the name).
            </p>
            <p>
              The player with the highest score at the end of the game is declared the winner.
            </p>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card className="p-6 shadow bg-blue-50">
            <h2 className="text-2xl font-semibold mb-4">Card Rankings</h2>
            <p className="mb-4">Cards in each suit rank from highest to lowest:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Ace (highest)</li>
              <li>King</li>
              <li>Queen</li>
              <li>Jack</li>
              <li>10</li>
              <li>9</li>
              <li>8</li>
              <li>7</li>
              <li>6</li>
              <li>5</li>
              <li>4</li>
              <li>3</li>
              <li>2 (lowest)</li>
            </ol>
          </Card>
          
          <Card className="p-6 shadow bg-green-50">
            <h2 className="text-2xl font-semibold mb-4">Common Terms</h2>
            <dl className="space-y-3">
              <div>
                <dt className="font-medium">Trump</dt>
                <dd className="ml-4 text-gray-600">A designated suit that outranks all other suits</dd>
              </div>
              <div>
                <dt className="font-medium">Trick</dt>
                <dd className="ml-4 text-gray-600">A round where each player plays one card; the highest card wins</dd>
              </div>
              <div>
                <dt className="font-medium">Bid</dt>
                <dd className="ml-4 text-gray-600">The number of tricks a player expects to win</dd>
              </div>
              <div>
                <dt className="font-medium">Follow Suit</dt>
                <dd className="ml-4 text-gray-600">Playing a card of the same suit that was led</dd>
              </div>
              <div>
                <dt className="font-medium">Void</dt>
                <dd className="ml-4 text-gray-600">Having no cards of a particular suit</dd>
              </div>
            </dl>
          </Card>
          
          <Card className="p-6 shadow">
            <h2 className="text-2xl font-semibold mb-4">Ready to Play?</h2>
            <p className="mb-6">
              Now that you understand the rules, you're ready to test your skills in a game of Ninety-Nine!
            </p>
            <div className="flex justify-center">
              <Link href="/game">
                <Button size="lg" className="w-full">
                  Start a Game
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 