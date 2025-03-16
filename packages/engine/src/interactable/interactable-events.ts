import type { EmptyObject } from '@game/shared';
import { TypedSerializableEvent } from '../utils/typed-emitter';
import type { SerializedUnit, Unit } from '../unit/entities/unit.entity';
import type { INTERACTABLE_EVENTS } from './interactable-enums';

export class InteractableEnterEvent extends TypedSerializableEvent<
  { Unit: Unit },
  { unit: SerializedUnit }
> {
  serialize() {
    return {
      unit: this.data.Unit.serialize()
    };
  }
}

export class InteractableLeaveEvent extends TypedSerializableEvent<
  { Unit: Unit },
  { unit: SerializedUnit }
> {
  serialize() {
    return {
      unit: this.data.Unit.serialize()
    };
  }
}

export class InteractableCreatedEvent extends TypedSerializableEvent<
  EmptyObject,
  EmptyObject
> {
  serialize() {
    return {};
  }
}

export class InteractableDestroyedEvent extends TypedSerializableEvent<
  EmptyObject,
  EmptyObject
> {
  serialize() {
    return {};
  }
}

export type InteractableEventMap = {
  [INTERACTABLE_EVENTS.BEFORE_ENTER]: InteractableEnterEvent;
  [INTERACTABLE_EVENTS.AFTER_ENTER]: InteractableEnterEvent;
  [INTERACTABLE_EVENTS.BEFORE_LEAVE]: InteractableLeaveEvent;
  [INTERACTABLE_EVENTS.AFTER_LEAVE]: InteractableLeaveEvent;
  [INTERACTABLE_EVENTS.CREATED]: InteractableCreatedEvent;
  [INTERACTABLE_EVENTS.BEFORE_DESTROY]: InteractableDestroyedEvent;
  [INTERACTABLE_EVENTS.AFTER_DESTROY]: InteractableDestroyedEvent;
};
