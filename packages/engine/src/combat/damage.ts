import type { BetterOmit, Values } from '@game/shared';
import type { Unit } from '../unit/entities/unit.entity';
import type { AbilityCard } from '../card/entities/ability-card.entity';

export const DAMAGE_TYPES = {
  COMBAT: 'COMBAT',
  ABILITY: 'ABILITY'
} as const;

export type DamageType = Values<typeof DAMAGE_TYPES>;

export type DamageOptions<T> = {
  source: T;
  baseAmount: number;
  type: DamageType;
};

export abstract class Damage<T> {
  protected _source: T;

  protected _baseAmount: number;

  readonly type: DamageType;

  constructor(options: DamageOptions<T>) {
    this._source = options.source;
    this._baseAmount = options.baseAmount;
    this.type = options.type;
  }

  get baseAmount() {
    return this._baseAmount;
  }

  get source() {
    return this._source;
  }

  abstract getFinalAmount(target: Unit): number;
  abstract getFinalAmount(target: Unit): number;
}

export class CombatDamage extends Damage<Unit> {
  constructor(options: BetterOmit<DamageOptions<Unit>, 'type'>) {
    super({ ...options, type: DAMAGE_TYPES.COMBAT });
  }

  getFinalAmount(target: Unit) {
    const scaled = this._source.getDealtDamage(target);

    return target.getReceivedDamage(scaled, this, this._source);
  }
}

export class AbilityDamage extends Damage<AbilityCard> {
  constructor(options: BetterOmit<DamageOptions<AbilityCard>, 'type'>) {
    super({ ...options, type: DAMAGE_TYPES.ABILITY });
  }

  getFinalAmount(target: Unit) {
    return target.getReceivedDamage(this.baseAmount, this, this._source.unit);
  }
}
