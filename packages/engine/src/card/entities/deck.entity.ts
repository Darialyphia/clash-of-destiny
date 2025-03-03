import { type EmptyObject, type Values } from '@game/shared';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import { shuffleArray } from '@game/shared';
import type { Game } from '../../game/game';
import { nanoid } from 'nanoid';
import { Entity } from '../../entity';
import type { AbilityCard, SerializedAbilityCard } from './ability-card.entity';
import type { ArtifactCard, SerializedArtifactCard } from './artifact-card.entity';
import type { QuestCard, SerializedQuestCard } from './quest-card.entity';

export const DECK_EVENTS = {
  BEFORE_DRAW: 'before_draw',
  AFTER_DRAW: 'after_draw'
} as const;

export type DeckEvent = Values<typeof DECK_EVENTS>;

export type DeckCard = AbilityCard | QuestCard | ArtifactCard;
export type SerializedDeckCard =
  | SerializedAbilityCard
  | SerializedQuestCard
  | SerializedArtifactCard;

export class DeckBeforeDrawEvent extends TypedSerializableEvent<
  { amount: number },
  { amount: number }
> {
  serialize() {
    return { amount: this.data.amount };
  }
}

export class DeckAfterDrawEvent extends TypedSerializableEvent<
  { cards: DeckCard[] },
  { cards: SerializedDeckCard[] }
> {
  serialize() {
    return { cards: this.data.cards.map(card => card.serialize()) };
  }
}

export type DeckEventMap = {
  [DECK_EVENTS.BEFORE_DRAW]: DeckBeforeDrawEvent;
  [DECK_EVENTS.AFTER_DRAW]: DeckAfterDrawEvent;
};

export class Deck extends Entity<DeckEventMap, EmptyObject> {
  private _size: number;

  constructor(
    private game: Game,
    public cards: DeckCard[]
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

  replace(replacedCard: DeckCard) {
    let replacement: DeckCard;
    let index: number;

    const shouldForceDifferentCard = this.cards.some(
      c => c.blueprintId !== replacedCard.blueprintId
    );

    do {
      index = this.game.rngSystem.nextInt(this.cards.length - 1);
      replacement = this.cards[index];
    } while (
      shouldForceDifferentCard &&
      replacement.blueprintId === replacedCard.blueprintId
    );

    this.cards[index] = replacedCard;
    return replacement;
  }

  addToTop(card: DeckCard) {
    this.cards.unshift(card);
    if (this.size < this.remaining) {
      this._size = this.remaining;
    }
  }

  addToBottom(card: DeckCard) {
    this.cards.push(card);
    if (this.size < this.remaining) {
      this._size = this.remaining;
    }
  }

  peek(amount: number) {
    return this.cards.slice(0, amount);
  }

  pluck(card: DeckCard) {
    this.cards = this.cards.filter(c => c !== card);
    return card;
  }

  shutdown() {
    this.emitter.removeAllListeners();
  }
}
