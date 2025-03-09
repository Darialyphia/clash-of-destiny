import type { AOEShape } from '../aoe/aoe-shapes';
import type { AnyCard } from '../card/entities/card.entity';
import type { Damage } from '../combat/damage';
import type { Modifier } from '../modifier/modifier.entity';
import type { Player } from '../player/player.entity';
import type { TargetingStrategy, TargetingType } from '../targeting/targeting-strategy';
import { Interceptable } from '../utils/interceptable';
import type { Unit } from './entities/unit.entity';

export type UnitInterceptors = {
  canMove: Interceptable<boolean>;
  canMoveThrough: Interceptable<boolean, { unit: Unit }>;
  apCostPerMovement: Interceptable<number>;

  canAttack: Interceptable<boolean, { unit: Unit }>;
  canBeAttackTarget: Interceptable<boolean, { attacker: Unit }>;
  apCostPerAttack: Interceptable<number>;

  canPlayCard: Interceptable<boolean, { card: AnyCard }>;
  canBeCardTarget: Interceptable<boolean, { card: AnyCard }>;
  apCostPerCard: Interceptable<number>;
  abilityPower: Interceptable<number>;

  canReceiveModifier: Interceptable<boolean, { modifier: Modifier<Unit> }>;
  canBeDestroyed: Interceptable<boolean>;

  maxHp: Interceptable<number>;
  maxAp: Interceptable<number>;
  maxMp: Interceptable<number>;

  mpRegen: Interceptable<number>;

  initiative: Interceptable<number>;

  attackTargetingPattern: Interceptable<TargetingStrategy>;
  attackTargetType: Interceptable<TargetingType>;
  attackAOEShape: Interceptable<AOEShape>;

  maxAttacksPerTurn: Interceptable<number>;
  maxMovementsPerTurn: Interceptable<number>;

  player: Interceptable<Player>;

  damageDealt: Interceptable<number, { target: Unit }>;
  damageReceived: Interceptable<
    number,
    { amount: number; source: Unit; damage: Damage<any> }
  >;

  healReceived: Interceptable<number, { source: AnyCard }>;
  healDealt: Interceptable<number, { target: Unit }>;
};

export const makeUnitInterceptors = (): UnitInterceptors => {
  return {
    canMove: new Interceptable(),
    canMoveThrough: new Interceptable(),
    apCostPerMovement: new Interceptable(),

    canAttack: new Interceptable(),
    canBeAttackTarget: new Interceptable(),
    apCostPerAttack: new Interceptable(),

    canPlayCard: new Interceptable(),
    canBeCardTarget: new Interceptable(),
    apCostPerCard: new Interceptable(),
    abilityPower: new Interceptable(),

    canReceiveModifier: new Interceptable(),
    canBeDestroyed: new Interceptable(),

    maxHp: new Interceptable(),
    maxAp: new Interceptable(),
    maxMp: new Interceptable(),

    mpRegen: new Interceptable(),
    initiative: new Interceptable(),

    attackTargetingPattern: new Interceptable(),
    attackTargetType: new Interceptable(),
    attackAOEShape: new Interceptable(),

    maxAttacksPerTurn: new Interceptable(),
    maxMovementsPerTurn: new Interceptable(),

    player: new Interceptable<Player>(),

    damageDealt: new Interceptable(),
    damageReceived: new Interceptable(),
    healDealt: new Interceptable(),
    healReceived: new Interceptable()
  };
};
