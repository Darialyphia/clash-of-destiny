import type { EmptyObject, Point, Vec2 } from '@game/shared';
import { TypedSerializableEvent } from '../utils/typed-emitter';
import type { UNIT_EVENTS } from './unit-enums';
import type { Damage } from '../combat/damage';
import type { SerializedUnit, Unit } from './entities/unit.entity';
import type { AnyCard, SerializedCard } from '../card/entities/card.entity';
import type { Cell, SerializedCell } from '../board/cell';
import type { Position } from '../utils/position.component';
import type { HeroCard, SerializedHeroCard } from '../card/entities/hero-card.entity';

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

export class UnitBeforeBounce extends TypedSerializableEvent<EmptyObject, EmptyObject> {
  serialize() {
    return {};
  }
}

export class UnitAfterBounce extends TypedSerializableEvent<
  { successful: boolean },
  { successful: boolean }
> {
  serialize() {
    return {
      successful: this.data.successful
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
  { targets: Unit[]; damage: Damage<AnyCard> },
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
  { from: AnyCard; target: Unit; damage: Damage<AnyCard> },
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

export class UnitExhaustEvent extends TypedSerializableEvent<EmptyObject, EmptyObject> {
  serialize() {
    return {};
  }
}

export class UnitWakeUpEvent extends TypedSerializableEvent<EmptyObject, EmptyObject> {
  serialize() {
    return {};
  }
}

export class UnitUseAbilityEvent extends TypedSerializableEvent<
  EmptyObject,
  EmptyObject
> {
  serialize() {
    return {};
  }
}

export class HeroBeforeEvolveEvent extends TypedSerializableEvent<
  { newCard: HeroCard },
  { newCard: SerializedHeroCard }
> {
  serialize() {
    return {
      newCard: this.data.newCard.serialize()
    };
  }
}

export class HeroAfterEvolveEvent extends TypedSerializableEvent<
  { prevCard: HeroCard; newCard: HeroCard },
  { prevCard: SerializedHeroCard; newCard: SerializedHeroCard }
> {
  serialize() {
    return {
      prevCard: this.data.prevCard.serialize(),
      newCard: this.data.newCard.serialize()
    };
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
  [UNIT_EVENTS.BEFORE_BOUNCE]: UnitBeforeBounce;
  [UNIT_EVENTS.AFTER_BOUNCE]: UnitAfterBounce;
  [UNIT_EVENTS.BEFORE_EXHAUST]: UnitExhaustEvent;
  [UNIT_EVENTS.AFTER_EXHAUST]: UnitExhaustEvent;
  [UNIT_EVENTS.BEFORE_WAKE_UP]: UnitWakeUpEvent;
  [UNIT_EVENTS.AFTER_WAKE_UP]: UnitWakeUpEvent;
  [UNIT_EVENTS.BEFORE_USE_ABILITY]: UnitUseAbilityEvent;
  [UNIT_EVENTS.AFTER_USE_ABILITY]: UnitUseAbilityEvent;
  [UNIT_EVENTS.BEFORE_EVOLVE_HERO]: HeroBeforeEvolveEvent;
  [UNIT_EVENTS.AFTER_EVOLVE_HERO]: HeroAfterEvolveEvent;
};
