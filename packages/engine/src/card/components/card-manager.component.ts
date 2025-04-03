import { isDefined } from '@game/shared';
import type { Game } from '../../game/game';
import { createCard } from '../card.factory';
import type { AnyCard, CardOptions } from '../entities/card.entity';
import { Deck } from '../entities/deck.entity';
import type {
  MainDeckCardBlueprint,
  DestinyDeckCardBlueprint,
  CardBlueprint
} from '../card-blueprint';
import type { Player } from '../../player/player.entity';
import { CARD_DECK_SOURCES } from '../card.enums';

export type CardManagerComponentOptions = {
  mainDeck: CardOptions<CardBlueprint & MainDeckCardBlueprint>[];
  destinyDeck: CardOptions<CardBlueprint & DestinyDeckCardBlueprint>[];
  maxHandSize: number;
  shouldShuffleDeck: boolean;
};

export class CardManagerComponent {
  private game: Game;

  readonly mainDeck: Deck<AnyCard>;

  readonly destinyDeck: Deck<AnyCard>;

  readonly hand: AnyCard[] = [];

  readonly discardPile = new Set<AnyCard>();

  readonly banishPile = new Set<AnyCard>();

  constructor(
    game: Game,
    player: Player,
    private options: CardManagerComponentOptions
  ) {
    this.game = game;
    this.mainDeck = new Deck(
      this.game,
      options.mainDeck.map(card => createCard(this.game, player, card))
    );
    this.destinyDeck = new Deck(
      this.game,
      options.destinyDeck.map(card => createCard(this.game, player, card))
    );
    if (options.shouldShuffleDeck) {
      this.mainDeck.shuffle();
    }
  }

  get isHandFull() {
    return this.hand.length === this.options.maxHandSize;
  }

  get remainingCardsInMainDeck() {
    return this.mainDeck.remaining;
  }

  get mainDeckSize() {
    return this.mainDeck.size;
  }

  get remainingCardsInDestinyDeck() {
    return this.destinyDeck.remaining;
  }

  get destinyDeckSize() {
    return this.destinyDeck.size;
  }

  getCardAt(index: number) {
    return [...this.hand][index];
  }

  getDestinyCardAt(index: number) {
    return this.destinyDeck.cards[index];
  }

  draw(amount: number) {
    if (this.isHandFull) return;

    const cards = this.mainDeck.draw(
      Math.min(amount, this.options.maxHandSize - this.hand.length)
    );

    cards.forEach(card => {
      this.hand.push(card);
      card.addToHand();
    });
  }

  removeFromHand(card: AnyCard) {
    const index = this.hand.findIndex(handCard => handCard.equals(card));
    if (index === -1) return;
    this.hand.splice(index, 1);
  }

  removeFromDestinyDeck(card: AnyCard) {
    const index = this.destinyDeck.cards.findIndex(destinyCard =>
      destinyCard.equals(card)
    );
    if (index === -1) return;
    this.destinyDeck.cards.splice(index, 1);
  }

  discard(card: AnyCard) {
    this.removeFromHand(card);
    this.sendToDiscardPile(card);
    card.discard();
  }

  play(card: AnyCard) {
    if (this.hand.includes(card)) {
      this.removeFromHand(card);
    }
    if (this.destinyDeck.cards.includes(card)) {
      this.removeFromDestinyDeck(card);
    }
    card.play();
  }

  sendToDiscardPile(card: AnyCard) {
    if (card.deckSource === CARD_DECK_SOURCES.DESTINY_DECK) {
      this.sendToBanishPile(card);
    } else {
      this.discardPile.add(card);
    }
  }

  removeFromDiscardPile(card: AnyCard) {
    this.discardPile.delete(card);
  }

  sendToBanishPile(card: AnyCard) {
    this.banishPile.add(card);
  }

  removeFromBanishPile(card: AnyCard) {
    this.banishPile.delete(card);
  }

  replaceCardAt(index: number) {
    const card = this.getCardAt(index);
    if (!card) return card;

    const replacement = this.mainDeck.replace(card);
    this.hand[index] = replacement;
    card.replace();
    replacement.addToHand();

    return replacement;
  }

  addToHand(card: AnyCard, index?: number) {
    if (this.isHandFull) return;
    if (isDefined(index)) {
      this.hand.splice(index, 0, card);
      return;
    }
    this.hand.push(card);
  }

  shutdown() {
    this.mainDeck.cards.forEach(card => {
      card.shutdown();
    });
    this.destinyDeck.cards.forEach(card => {
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
