import type { EmptyObject, Point, Vec2 } from '@game/shared';
import { TypedSerializableEvent } from '../utils/typed-emitter';
import type { UNIT_EVENTS } from './unit-enums';
import type { Damage } from '../combat/damage';
import type { SerializedUnit, Unit } from './entities/unit.entity';
import type { AnyCard, SerializedCard } from '../card/entities/card.entity';
import type { Cell, SerializedCell } from '../board/cell';
import type { Position } from '../utils/position.component';

export class UnitCreatedEvent extends TypedSerializableEvent<
  { affectedCells: Cell[]; affectedUnits: Unit[] },
  { affectedCells: SerializedCell[]; affectedUnits: SerializedUnit[] }
> {
  get cells() {
    return this.data.affectedCells;
  }

  get units() {
    return this.data.affectedUnits;
  }

  serialize(): { affectedCells: SerializedCell[]; affectedUnits: SerializedUnit[] } {
    return {
      affectedCells: this.data.affectedCells.map(cell => cell.serialize()),
      affectedUnits: this.data.affectedUnits.map(unit => unit.serialize())
    };
  }
}

export class UnitBeforeMoveEvent extends TypedSerializableEvent<
  { position: Vec2; path: Vec2[] },
  { position: Point; path: Point[] }
> {
  serialize() {
    return {
      position: this.data.position.serialize(),
      path: this.data.path.map(vec => vec.serialize())
    };
  }
}

export class UnitAfterMoveEvent extends TypedSerializableEvent<
  { position: Vec2; previousPosition: Vec2; path: Vec2[] },
  { position: Point; previousPosition: Point; path: Point[] }
> {
  serialize() {
    return {
      position: this.data.position.serialize(),
      previousPosition: this.data.previousPosition.serialize(),
      path: this.data.path.map(vec => vec.serialize())
    };
  }
}

export class UnitAttackEvent extends TypedSerializableEvent<
  { target: Vec2 },
  { target: Point }
> {
  serialize() {
    return {
      target: this.data.target.serialize()
    };
  }

  get target() {
    return this.data.target;
  }
}

export class UnitDealDamageEvent extends TypedSerializableEvent<
  { targets: Unit[]; damage: Damage },
  { targets: Array<{ unit: SerializedUnit; damage: number }> }
> {
  serialize() {
    return {
      targets: this.data.targets.map(target => ({
        unit: target.serialize(),
        damage: this.data.damage.getFinalAmount(target)
      }))
    };
  }
}

export class UnitReceiveDamageEvent extends TypedSerializableEvent<
  { from: AnyCard; target: Unit; damage: Damage },
  { from: SerializedCard; damage: number }
> {
  serialize() {
    return {
      from: this.data.from.serialize(),
      damage: this.data.damage.getFinalAmount(this.data.target)
    };
  }
}

export class UnitReceiveHealEvent extends TypedSerializableEvent<
  { from: AnyCard; amount: number },
  { from: SerializedCard; amount: number }
> {
  serialize() {
    return {
      from: this.data.from.serialize(),
      amount: this.data.amount
    };
  }
}

export class UnitBeforeDestroyEvent extends TypedSerializableEvent<
  { source: AnyCard },
  { source: SerializedCard }
> {
  serialize() {
    return {
      source: this.data.source.serialize()
    };
  }
}

export class UnitAfterDestroyEvent extends TypedSerializableEvent<
  { source: AnyCard; destroyedAt: Position },
  { source: SerializedCard; destroyedAt: Point }
> {
  serialize() {
    return {
      source: this.data.source.serialize(),
      destroyedAt: this.data.destroyedAt.serialize()
    };
  }
}

export class UnitPlayCardEvent extends TypedSerializableEvent<
  { card: AnyCard },
  { card: SerializedCard }
> {
  serialize() {
    return {
      card: this.data.card.serialize()
    };
  }
}

export class UnitTurnEvent extends TypedSerializableEvent<EmptyObject, EmptyObject> {
  serialize() {
    return {};
  }
}

export type UnitEventMap = {
  [UNIT_EVENTS.CREATED]: UnitCreatedEvent;
  [UNIT_EVENTS.BEFORE_MOVE]: UnitBeforeMoveEvent;
  [UNIT_EVENTS.AFTER_MOVE]: UnitAfterMoveEvent;
  [UNIT_EVENTS.BEFORE_TELEPORT]: UnitBeforeMoveEvent;
  [UNIT_EVENTS.AFTER_TELEPORT]: UnitAfterMoveEvent;
  [UNIT_EVENTS.BEFORE_ATTACK]: UnitAttackEvent;
  [UNIT_EVENTS.AFTER_ATTACK]: UnitAttackEvent;
  [UNIT_EVENTS.BEFORE_COUNTERATTACK]: UnitAttackEvent;
  [UNIT_EVENTS.AFTER_COUNTERATTACK]: UnitAttackEvent;
  [UNIT_EVENTS.BEFORE_DEAL_DAMAGE]: UnitDealDamageEvent;
  [UNIT_EVENTS.AFTER_DEAL_DAMAGE]: UnitDealDamageEvent;
  [UNIT_EVENTS.BEFORE_RECEIVE_DAMAGE]: UnitReceiveDamageEvent;
  [UNIT_EVENTS.AFTER_RECEIVE_DAMAGE]: UnitReceiveDamageEvent;
  [UNIT_EVENTS.BEFORE_RECEIVE_HEAL]: UnitReceiveHealEvent;
  [UNIT_EVENTS.AFTER_RECEIVE_HEAL]: UnitReceiveHealEvent;
  [UNIT_EVENTS.BEFORE_DESTROY]: UnitBeforeDestroyEvent;
  [UNIT_EVENTS.AFTER_DESTROY]: UnitAfterDestroyEvent;
  [UNIT_EVENTS.BEFORE_PLAY_CARD]: UnitPlayCardEvent;
  [UNIT_EVENTS.AFTER_PLAY_CARD]: UnitPlayCardEvent;
  [UNIT_EVENTS.START_TURN]: UnitTurnEvent;
  [UNIT_EVENTS.END_TURN]: UnitTurnEvent;
};
