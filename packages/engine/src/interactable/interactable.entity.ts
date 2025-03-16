import {
  type Point,
  type Nullable,
  type AnyObject,
  type Serializable
} from '@game/shared';
import { Entity } from '../entity';
import { OBSTACLES } from './interactables/_index';
import type { Game } from '../game/game';

import { Position } from '../utils/position.component';
import { Unit } from '../unit/entities/unit.entity';
import { Interceptable } from '../utils/interceptable';
import {
  InteractableCreatedEvent,
  InteractableDestroyedEvent,
  InteractableEnterEvent,
  type InteractableEventMap
} from './interactable-events';
import { INTERACTABLE_EVENTS } from './interactable-enums';
import type { InteractableBlueprint } from './interactable-blueprint';

export type InteractableOptions = {
  id: string;
  blueprintId: string;
  position: Point;
};

export type InteractableInterceptors = {
  canWalkOn: Interceptable<boolean, { unit: Unit }>;
};
export const makeInterceptors = (): InteractableInterceptors => {
  return {
    canWalkOn: new Interceptable()
  };
};

export type SerializedInteractable = {
  id: string;
  entityType: 'interactable';
  name: string;
  description: string;
  position: Point;
  spriteId: string;
  iconId: string;
};

export class Interactable
  extends Entity<InteractableEventMap, InteractableInterceptors>
  implements Serializable<SerializedInteractable>
{
  position: Position;
  blueprintId: string;
  occupant: Nullable<Unit> = null;
  spriteId: string;
  iconId: string;
  meta: AnyObject = {};
  isAttackable: boolean;

  constructor(
    private game: Game,
    options: InteractableOptions
  ) {
    super(options.id, makeInterceptors());
    this.blueprintId = options.blueprintId;
    this.spriteId = this.blueprint.spriteId;
    this.iconId = this.blueprint.iconId;
    this.position = Position.fromPoint(options.position);
    this.isAttackable = this.blueprint.attackable;
    this.checkOccupation = this.checkOccupation.bind(this);
    this.game.on('*', this.checkOccupation);

    this.checkOccupation();
    this.blueprint.onCreated?.(this.game, this);
  }

  get name() {
    return this.blueprint.name;
  }

  get description() {
    return this.blueprint.description;
  }

  get blueprint(): InteractableBlueprint {
    return OBSTACLES[this.blueprintId];
  }

  get isWalkable() {
    return this.blueprint.walkable;
  }

  private checkOccupation() {
    const previous = this.occupant;

    this.occupant = this.game.unitSystem.getUnitAt(this.position);
    if (!previous && this.occupant) {
      this.emitter.emit(
        INTERACTABLE_EVENTS.BEFORE_ENTER,
        new InteractableEnterEvent({ Unit: this.occupant })
      );
      this.blueprint.onEnter?.(this.game, this);
      this.emitter.emit(
        INTERACTABLE_EVENTS.AFTER_ENTER,
        new InteractableEnterEvent({ Unit: this.occupant })
      );
    } else if (previous && !this.occupant) {
      this.emitter.emit(
        INTERACTABLE_EVENTS.BEFORE_LEAVE,
        new InteractableEnterEvent({ Unit: previous })
      );
      this.blueprint.onLeave?.(this.game, this);
      this.emitter.emit(
        INTERACTABLE_EVENTS.AFTER_LEAVE,
        new InteractableEnterEvent({ Unit: previous })
      );
    }
  }

  addToBoard() {
    this.emitter.emit(INTERACTABLE_EVENTS.CREATED, new InteractableCreatedEvent({}));
  }

  destroy() {
    this.emitter.emit(
      INTERACTABLE_EVENTS.BEFORE_DESTROY,
      new InteractableDestroyedEvent({})
    );
    this.blueprint.onDestroyed?.(this.game, this);
    this.game.off('*', this.checkOccupation);
    this.emitter.emit(
      INTERACTABLE_EVENTS.AFTER_DESTROY,
      new InteractableDestroyedEvent({})
    );
  }

  serialize(): SerializedInteractable {
    return {
      id: this.id,
      entityType: 'interactable',
      name: this.name,
      description: this.description,
      position: this.position.serialize(),
      spriteId: this.spriteId,
      iconId: this.iconId
    };
  }
}
