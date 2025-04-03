import { type EmptyObject, type Values } from '@game/shared';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import { shuffleArray } from '@game/shared';
import type { Game } from '../../game/game';
import { nanoid } from 'nanoid';
import { Entity } from '../../entity';
import type { SerializedSpellCard } from './spell-card.entity';
import type { SerializedArtifactCard } from './artifact-card.entity';
import type { AnyCard, SerializedCard } from './card.entity';

export const DECK_EVENTS = {
  BEFORE_DRAW: 'before_draw',
  AFTER_DRAW: 'after_draw'
} as const;

export type DeckEvent = Values<typeof DECK_EVENTS>;

export class DeckBeforeDrawEvent extends TypedSerializableEvent<
  { amount: number },
  { amount: number }
> {
  serialize() {
    return { amount: this.data.amount };
  }
}

export class DeckAfterDrawEvent extends TypedSerializableEvent<
  { cards: AnyCard[] },
  { cards: SerializedCard[] }
> {
  serialize() {
    return { cards: this.data.cards.map(card => card.serialize()) };
  }
}

export type DeckEventMap = {
  [DECK_EVENTS.BEFORE_DRAW]: DeckBeforeDrawEvent;
  [DECK_EVENTS.AFTER_DRAW]: DeckAfterDrawEvent;
};

export class Deck<TCard extends AnyCard> extends Entity<DeckEventMap, EmptyObject> {
  private _size: number;

  constructor(
    private game: Game,
    public cards: TCard[]
  ) {
    super(`deck_${nanoid(4)}`, {});
    this._size = this.cards.length;
  }

  get size() {
    return this._size;
  }

  get remaining() {
    return this.cards.length;
  }

  get on() {
    return this.emitter.on.bind(this.emitter);
  }

  get once() {
    return this.emitter.once.bind(this.emitter);
  }

  get off() {
    return this.emitter.off.bind(this.emitter);
  }

  shuffle() {
    this.cards = shuffleArray(this.cards, () => this.game.rngSystem.next());
  }

  draw(amount: number) {
    this.emitter.emit(DECK_EVENTS.BEFORE_DRAW, new DeckBeforeDrawEvent({ amount }));

    const cards = this.cards.splice(0, amount);

    this.emitter.emit(DECK_EVENTS.AFTER_DRAW, new DeckAfterDrawEvent({ cards }));

    return cards;
  }

  replace(replacedCard: TCard) {
    this.addToBottom(replacedCard);

    return this.draw(1)[0];
  }

  addToTop(card: TCard) {
    this.cards.unshift(card);
    if (this.size < this.remaining) {
      this._size = this.remaining;
    }
  }

  addToBottom(card: TCard) {
    this.cards.push(card);
    if (this.size < this.remaining) {
      this._size = this.remaining;
    }
  }

  peek(amount: number) {
    return this.cards.slice(0, amount);
  }

  pluck(card: TCard) {
    this.cards = this.cards.filter(c => c !== card);
    return card;
  }

  shutdown() {
    this.emitter.removeAllListeners();
  }
}
