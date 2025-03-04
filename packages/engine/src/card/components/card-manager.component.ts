import { isDefined } from '@game/shared';
import type { Game } from '../../game/game';
import type { Player } from '../../player/player.entity';
import { createCard } from '../card.factory';
import type { CardOptions } from '../entities/card.entity';
import { Deck, type DeckCard } from '../entities/deck.entity';
import type {
  AbilityBlueprint,
  ArtifactBlueprint,
  QuestBlueprint
} from '../card-blueprint';
import type { Unit } from '../../unit/entities/unit.entity';

export type CardManagerComponentOptions = {
  deck: CardOptions<QuestBlueprint | AbilityBlueprint | ArtifactBlueprint>[];
  maxHandSize: number;
  shouldShuffleDeck: boolean;
};

export class CardManagerComponent {
  private game: Game;

  readonly deck: Deck;

  readonly hand: DeckCard[] = [];

  readonly discardPile = new Set<DeckCard>();

  constructor(
    game: Game,
    unit: Unit,
    private options: CardManagerComponentOptions
  ) {
    this.game = game;
    this.deck = new Deck(
      this.game,
      options.deck.map(card => createCard(this.game, unit, card))
    );
    if (options.shouldShuffleDeck) {
      this.deck.shuffle();
    }
  }

  get isHandFull() {
    return this.hand.length === this.options.maxHandSize;
  }

  get remainingCardsInDeck() {
    return this.deck.remaining;
  }

  get deckSize() {
    return this.deck.size;
  }

  getCardAt(index: number) {
    return [...this.hand][index];
  }

  draw(amount: number) {
    if (this.isHandFull) return;

    const cards = this.deck.draw(
      Math.min(amount, this.options.maxHandSize - this.hand.length)
    );

    cards.forEach(card => {
      this.hand.push(card);
      card.addtoHand();
    });
  }

  removeFromHand(card: DeckCard) {
    const index = this.hand.findIndex(handCard => handCard.equals(card));
    this.hand.splice(index, 1);
  }

  discard(card: DeckCard) {
    this.removeFromHand(card);
    this.sendToDiscardPile(card);
    card.discard();
  }

  play(card: DeckCard) {
    if (this.hand.includes(card)) {
      this.removeFromHand(card);
    }
    card.play();
  }

  sendToDiscardPile(card: DeckCard) {
    this.discardPile.add(card);
  }

  removeFromDiscardPile(card: DeckCard) {
    this.discardPile.delete(card);
  }

  replaceCardAt(index: number) {
    const card = this.getCardAt(index);
    if (!card) return card;

    const replacement = this.deck.replace(card);
    this.hand[index] = replacement;
    card.replace();
    replacement.addtoHand();

    return replacement;
  }

  addToHand(card: DeckCard, index?: number) {
    if (this.isHandFull) return;
    if (isDefined(index)) {
      this.hand.splice(index, 0, card);
      return;
    }
    this.hand.push(card);
  }

  shutdown() {
    this.deck.cards.forEach(card => {
      card.shutdown();
    });
    this.hand.forEach(card => {
      card.shutdown();
    });
    this.discardPile.forEach(card => {
      card.shutdown();
    });
  }
}
