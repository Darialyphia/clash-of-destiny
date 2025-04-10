import type { BetterOmit, Values } from '@game/shared';
import type { Unit } from '../unit/entities/unit.entity';
import type { AnyUnitCard } from '../card/entities/unit-card.entity';
import type { ArtifactCard } from '../card/entities/artifact-card.entity';
import type { SpellCard } from '../card/entities/spell-card.entity';

export const DAMAGE_TYPES = {
  COMBAT: 'COMBAT',
  SPELL: 'SPELL',
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

export class CombatDamage extends Damage<AnyUnitCard> {
  constructor(options: BetterOmit<DamageOptions<AnyUnitCard>, 'type'>) {
    super({ ...options, type: DAMAGE_TYPES.COMBAT });
  }

  getFinalAmount(target: Unit) {
    const scaled = this._source.unit.getDealtDamage(target);

    return Math.max(0, target.getReceivedDamage(scaled, this, this._source));
  }
}

export class SpellDamage extends Damage<SpellCard> {
  constructor(options: BetterOmit<DamageOptions<SpellCard>, 'type'>) {
    super({ ...options, type: DAMAGE_TYPES.SPELL });
  }

  getFinalAmount(target: Unit) {
    return Math.max(0, target.getReceivedDamage(this.baseAmount, this, this._source));
  }
}

export class AbilityDamage extends Damage<AnyUnitCard | ArtifactCard> {
  constructor(options: BetterOmit<DamageOptions<AnyUnitCard | ArtifactCard>, 'type'>) {
    super({ ...options, type: DAMAGE_TYPES.ABILITY });
  }

  getFinalAmount(target: Unit) {
    return Math.max(0, target.getReceivedDamage(this.baseAmount, this, this._source));
  }
}
