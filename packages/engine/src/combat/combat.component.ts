import { Vec2, type Point, type Values } from '@game/shared';
import {} from '../config';
import type { Game } from '../game/game';
import type { SerializedUnit, Unit } from '../unit/entities/unit.entity';
import { CombatDamage, Damage } from './damage';
import {
  TypedSerializableEvent,
  TypedSerializableEventEmitter
} from '../utils/typed-emitter';
import type { AnyCard, SerializedCard } from '../card/entities/card.entity';

export const COMBAT_EVENTS = {
  BEFORE_ATTACK: 'before_attack',
  AFTER_ATTACK: 'after_attack',
  BEFORE_COUNTERATTACK: 'before_counterattack',
  AFTER_COUNTERATTACK: 'after_counterattack',
  BEFORE_DEAL_DAMAGE: 'before_deal_damage',
  AFTER_DEAL_DAMAGE: 'after_deal_damage',
  BEFORE_RECEIVE_DAMAGE: 'before_receive_damage',
  AFTER_RECEIVE_DAMAGE: 'after_receive_damage'
} as const;

export type CombatEvent = Values<typeof COMBAT_EVENTS>;

export class AttackEvent extends TypedSerializableEvent<
  { target: Vec2 },
  { target: Point }
> {
  serialize() {
    return {
      target: this.data.target.serialize()
    };
  }
}

export class DealDamageEvent extends TypedSerializableEvent<
  { targets: Unit[]; damage: Damage<AnyCard> },
  { targets: SerializedUnit[] }
> {
  serialize() {
    return {
      targets: this.data.targets.map(target => target.serialize())
    };
  }
}

export class ReceiveDamageEvent extends TypedSerializableEvent<
  { from: AnyCard; damage: Damage<AnyCard> },
  { from: SerializedCard }
> {
  serialize() {
    return {
      from: this.data.from.serialize()
    };
  }
}

export type CombatEventMap = {
  [COMBAT_EVENTS.BEFORE_ATTACK]: AttackEvent;
  [COMBAT_EVENTS.AFTER_ATTACK]: AttackEvent;
  [COMBAT_EVENTS.BEFORE_COUNTERATTACK]: AttackEvent;
  [COMBAT_EVENTS.AFTER_COUNTERATTACK]: AttackEvent;
  [COMBAT_EVENTS.BEFORE_DEAL_DAMAGE]: DealDamageEvent;
  [COMBAT_EVENTS.AFTER_DEAL_DAMAGE]: DealDamageEvent;
  [COMBAT_EVENTS.BEFORE_RECEIVE_DAMAGE]: ReceiveDamageEvent;
  [COMBAT_EVENTS.AFTER_RECEIVE_DAMAGE]: ReceiveDamageEvent;
};

export class CombatComponent {
  private _attacksCount = 0;
  private _counterAttacksCount = 0;
  private emitter = new TypedSerializableEventEmitter<CombatEventMap>();

  constructor(
    private game: Game,
    private unit: Unit
  ) {}

  get counterAttacksCount() {
    return this._counterAttacksCount;
  }

  get attacksCount() {
    return this._attacksCount;
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

  setAttackCount(count: number) {
    this._attacksCount = count;
  }

  resetAttackCount() {
    this._attacksCount = 0;
    this._counterAttacksCount = 0;
  }

  resetCounterAttackCount() {
    this._counterAttacksCount = 0;
  }

  counterAttack(attacker: Unit) {
    this.emitter.emit(
      COMBAT_EVENTS.BEFORE_COUNTERATTACK,
      new AttackEvent({
        target: attacker.position
      })
    );
    const targets = this.unit.counterattackAOEShape.getUnits([attacker.position]);

    const damage = new CombatDamage({
      baseAmount: 0,
      source: this.unit.card
    });

    this.dealDamage(targets, damage);
    this._counterAttacksCount++;

    this.emitter.emit(
      COMBAT_EVENTS.AFTER_COUNTERATTACK,
      new AttackEvent({
        target: attacker.position
      })
    );
  }

  attack(target: Point) {
    this.emitter.emit(
      COMBAT_EVENTS.BEFORE_ATTACK,
      new AttackEvent({
        target: Vec2.fromPoint(target)
      })
    );
    const targets = this.unit.attackAOEShape.getUnits([target]);
    const damage = new CombatDamage({
      baseAmount: 0,
      source: this.unit.card
    });

    this.dealDamage(targets, damage);
    this._attacksCount++;

    const unit = this.game.unitSystem.getUnitAt(target)!;
    if (!unit) return; // means unit died from attack
    // we check counterattack before emitting AFTER_ATTACK event to enable effects that would prevent counter attack for one attack only
    // ex: Fearsome
    const counterAttackParticipants = this.unit
      .getCounterattackParticipants(unit)
      .filter(unit => {
        return (
          unit.canCounterAttackAt(this.unit.position) &&
          this.unit.canBeCounterattackedBy(unit)
        );
      });

    this.emitter.emit(
      COMBAT_EVENTS.AFTER_ATTACK,
      new AttackEvent({
        target: Vec2.fromPoint(target)
      })
    );

    counterAttackParticipants.forEach(unit => {
      unit.counterAttack(this.unit);
    });
  }

  dealDamage(targets: Unit[], damage: Damage<AnyCard>) {
    this.emitter.emit(
      COMBAT_EVENTS.BEFORE_DEAL_DAMAGE,
      new DealDamageEvent({ targets, damage })
    );
    targets.forEach(target => {
      target.takeDamage(this.unit.card, damage);
    });
    this.emitter.emit(
      COMBAT_EVENTS.AFTER_DEAL_DAMAGE,
      new DealDamageEvent({ targets, damage })
    );
  }

  takeDamage(from: AnyCard, damage: Damage<AnyCard>) {
    this.emitter.emit(
      COMBAT_EVENTS.BEFORE_RECEIVE_DAMAGE,
      new ReceiveDamageEvent({
        from,
        damage
      })
    );

    this.unit.hp.remove(damage.getFinalAmount(this.unit));
    this.emitter.emit(
      COMBAT_EVENTS.AFTER_RECEIVE_DAMAGE,
      new ReceiveDamageEvent({
        from,
        damage
      })
    );
  }

  shutdown() {
    this.emitter.removeAllListeners();
  }
}
