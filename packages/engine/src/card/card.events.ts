import type { EmptyObject, Point } from '@game/shared';
import { TypedSerializableEvent } from '../utils/typed-emitter';
import type { CARD_EVENTS } from './card.enums';

export class CardBeforePlayEvent extends TypedSerializableEvent<
  { targets: Point[] },
  { targets: Point[] }
> {
  serialize() {
    return {
      targets: this.data.targets
    };
  }
}

export class CardAfterPlayEvent extends TypedSerializableEvent<
  { targets: Point[] },
  { targets: Point[] }
> {
  serialize() {
    return {
      targets: this.data.targets
    };
  }
}

export class CardAddtoHandEvent extends TypedSerializableEvent<EmptyObject, EmptyObject> {
  serialize() {
    return {};
  }
}

export class CardReplaceEvent extends TypedSerializableEvent<EmptyObject, EmptyObject> {
  serialize() {
    return {};
  }
}

export class CardDiscardEvent extends TypedSerializableEvent<EmptyObject, EmptyObject> {
  serialize() {
    return {};
  }
}

export type CardEventMap = {
  [CARD_EVENTS.BEFORE_PLAY]: CardBeforePlayEvent;
  [CARD_EVENTS.AFTER_PLAY]: CardAfterPlayEvent;
  [CARD_EVENTS.ADD_TO_HAND]: CardAddtoHandEvent;
  [CARD_EVENTS.REPLACE]: CardReplaceEvent;
  [CARD_EVENTS.DISCARD]: CardDiscardEvent;
};
