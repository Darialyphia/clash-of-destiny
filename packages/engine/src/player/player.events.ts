import type { EmptyObject } from '@game/shared';
import { TypedSerializableEvent } from '../utils/typed-emitter';
import type { PLAYER_EVENTS } from './player-enums';
import type { AnyCard, SerializedCard } from '../card/entities/card.entity';
import type { DeckCard, SerializedDeckCard } from '../card/entities/deck.entity';

export class PlayerStartTurnEvent extends TypedSerializableEvent<
  EmptyObject,
  EmptyObject
> {
  serialize() {
    return {};
  }
}

export class PlayerEndTurnEvent extends TypedSerializableEvent<EmptyObject, EmptyObject> {
  serialize() {
    return {};
  }
}

export class PlayerManaChangeEvent extends TypedSerializableEvent<
  { amount: number },
  { amount: number }
> {
  serialize() {
    return {
      amount: this.data.amount
    };
  }
}

export class PlayCardEvent extends TypedSerializableEvent<
  { card: AnyCard },
  { card: SerializedCard }
> {
  serialize() {
    return {
      card: this.data.card.serialize()
    };
  }
}

export class PlayerBeforeReplaceCardEvent extends TypedSerializableEvent<
  { card: DeckCard },
  { card: SerializedDeckCard }
> {
  serialize() {
    return {
      card: this.data.card.serialize()
    };
  }
}

export class PlayerAfterReplaceCardEvent extends TypedSerializableEvent<
  { card: DeckCard; replacement: DeckCard },
  {
    card: SerializedDeckCard;
    replacement: SerializedDeckCard;
  }
> {
  serialize() {
    return {
      card: this.data.card.serialize(),
      replacement: this.data.replacement.serialize()
    };
  }
}

export class PlayerMulliganEvent extends TypedSerializableEvent<
  { indices: number[] },
  { indices: number[] }
> {
  serialize() {
    return {
      indices: this.data.indices
    };
  }
}

export type PlayerEventMap = {
  [PLAYER_EVENTS.START_TURN]: PlayerStartTurnEvent;
  [PLAYER_EVENTS.END_TURN]: PlayerEndTurnEvent;
  [PLAYER_EVENTS.BEFORE_MANA_CHANGE]: PlayerManaChangeEvent;
  [PLAYER_EVENTS.AFTER_MANA_CHANGE]: PlayerManaChangeEvent;
  [PLAYER_EVENTS.BEFORE_PLAY_CARD]: PlayCardEvent;
  [PLAYER_EVENTS.AFTER_PLAY_CARD]: PlayCardEvent;
  [PLAYER_EVENTS.BEFORE_REPLACE_CARD]: PlayerBeforeReplaceCardEvent;
  [PLAYER_EVENTS.AFTER_REPLACE_CARD]: PlayerAfterReplaceCardEvent;
  [PLAYER_EVENTS.MULLIGAN]: PlayerMulliganEvent;
};
