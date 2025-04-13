import type { PLAYER_EVENTS } from './player-enums';
import { TypedSerializableEvent } from '../utils/typed-emitter';
import type { AnyCard, SerializedCard } from '../card/entities/card.entity';
import type { EmptyObject } from '@game/shared';

export class PlayerPlayCardEvent extends TypedSerializableEvent<
  { card: AnyCard },
  { card: SerializedCard }
> {
  serialize() {
    return {
      card: this.data.card.serialize()
    };
  }
}

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

export class PlayerDrawEvent extends TypedSerializableEvent<
  { amount: number },
  { amount: number }
> {
  serialize() {
    return {
      amount: this.data.amount
    };
  }
}

export class PlayerResourceActionEvent extends TypedSerializableEvent<
  EmptyObject,
  EmptyObject
> {
  serialize() {
    return {};
  }
}

export class PlayerResourceActionDestinyEvent extends TypedSerializableEvent<
  { amount: number },
  { amount: number }
> {
  serialize() {
    return {
      amount: this.data.amount
    };
  }
}

export class PlayerSecretEvent extends TypedSerializableEvent<
  { card: AnyCard },
  { card: SerializedCard }
> {
  serialize() {
    return {
      card: this.data.card.serialize()
    };
  }
}

export type PlayerEventMap = {
  [PLAYER_EVENTS.START_TURN]: PlayerStartTurnEvent;
  [PLAYER_EVENTS.END_TURN]: PlayerEndTurnEvent;
  [PLAYER_EVENTS.BEFORE_PLAY_CARD]: PlayerPlayCardEvent;
  [PLAYER_EVENTS.AFTER_PLAY_CARD]: PlayerPlayCardEvent;
  [PLAYER_EVENTS.BEFORE_DRAW]: PlayerDrawEvent;
  [PLAYER_EVENTS.AFTER_DRAW]: PlayerDrawEvent;
  [PLAYER_EVENTS.BEFORE_RESOURCE_ACTION_DRAW]: PlayerResourceActionEvent;
  [PLAYER_EVENTS.AFTER_RESOURCE_ACTION_DRAW]: PlayerResourceActionEvent;
  [PLAYER_EVENTS.BEFORE_RESOURCE_ACTION_REPLACE]: PlayerResourceActionEvent;
  [PLAYER_EVENTS.AFTER_RESOURCE_ACTION_REPLACE]: PlayerResourceActionEvent;
  [PLAYER_EVENTS.BEFORE_RESOURCE_ACTION_DESTINY]: PlayerResourceActionDestinyEvent;
  [PLAYER_EVENTS.AFTER_RESOURCE_ACTION_DESTINY]: PlayerResourceActionDestinyEvent;
  [PLAYER_EVENTS.BEFORE_TRIGGER_SECRET]: PlayerSecretEvent;
  [PLAYER_EVENTS.AFTER_TRIGGER_SECRET]: PlayerSecretEvent;
};
