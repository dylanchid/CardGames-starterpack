import { z } from 'zod';

// Card schema
const CardSchema = z.object({
  suit: z.string(),
  rank: z.string(),
});

// Game state schema
const GameStateSchema = z.object({
  deck: z.array(CardSchema),
  currentTrick: z.array(z.object({
    suit: z.string(),
    rank: z.string(),
    player: z.number(),
  })),
  scores: z.record(z.string(), z.number()),
});

type Card = z.infer<typeof CardSchema>;
type GameState = z.infer<typeof GameStateSchema>;

class GameService {
  private deck: Card[];
  private currentTrick: GameState['currentTrick'];
  private scores: Record<string, number>;

  constructor() {
    this.deck = this.createDeck();
    this.currentTrick = [];
    this.scores = {};
  }

  private createDeck(): Card[] {
    const suits = ['♠', '♥', '♣', '♦'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck: Card[] = [];

    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({ suit, rank });
      }
    }

    return this.shuffleDeck(deck);
  }

  private shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  public dealCards(numPlayers: number): Card[][] {
    const hands: Card[][] = [];
    const cardsPerHand = Math.floor(this.deck.length / numPlayers);

    for (let i = 0; i < numPlayers; i++) {
      hands.push(this.deck.slice(i * cardsPerHand, (i + 1) * cardsPerHand));
    }

    return hands;
  }

  public playCard(card: Card, player: number): boolean {
    // Validate if the card can be played
    if (this.currentTrick.length > 0) {
      const leadingSuit = this.currentTrick[0].suit;
      if (card.suit !== leadingSuit) {
        // Check if player has the leading suit
        return false;
      }
    }

    this.currentTrick.push({ ...card, player });
    return true;
  }

  public determineTrickWinner(): number {
    if (this.currentTrick.length === 0) return -1;

    const leadingSuit = this.currentTrick[0].suit;
    let highestCard = this.currentTrick[0];
    let winner = 0;

    for (let i = 1; i < this.currentTrick.length; i++) {
      const card = this.currentTrick[i];
      if (card.suit === leadingSuit && this.compareCards(card, highestCard) > 0) {
        highestCard = card;
        winner = i;
      }
    }

    return winner;
  }

  private compareCards(card1: Card, card2: Card): number {
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const rank1 = ranks.indexOf(card1.rank);
    const rank2 = ranks.indexOf(card2.rank);
    return rank1 - rank2;
  }

  public updateScore(playerId: string, points: number): void {
    this.scores[playerId] = (this.scores[playerId] || 0) + points;
  }

  public getState(): GameState {
    return {
      deck: this.deck,
      currentTrick: this.currentTrick,
      scores: this.scores,
    };
  }

  public clearTrick(): void {
    this.currentTrick = [];
  }
}

export const gameService = new GameService(); 