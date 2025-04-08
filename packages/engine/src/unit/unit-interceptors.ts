import type { AOEShape } from '../aoe/aoe-shapes';
import type { Ability } from '../card/card-blueprint';
import type { AnyCard } from '../card/entities/card.entity';
import type { AnyUnitCard } from '../card/entities/unit-card.entity';
import type { CounterAttackParticipantStrategy } from '../combat/counterattack-participants';
import type { Damage } from '../combat/damage';
import type { Modifier } from '../modifier/modifier.entity';
import type { Player } from '../player/player.entity';
import type { TargetingStrategy, TargetingType } from '../targeting/targeting-strategy';
import { Interceptable } from '../utils/interceptable';
import type { Unit } from './entities/unit.entity';

export type UnitInterceptors = {
  canMove: Interceptable<boolean>;
  canMoveThrough: Interceptable<boolean, { unit: Unit }>;
  canMoveAfterAttacking: Interceptable<boolean>;
  canAttack: Interceptable<boolean, { unit: Unit }>;
  canCounterAttack: Interceptable<boolean, { attacker: Unit }>;
  canBeAttackTarget: Interceptable<boolean, { attacker: Unit }>;
  canBeCounterattackTarget: Interceptable<boolean, { attacker: Unit }>;
  canBeCardTarget: Interceptable<boolean, { card: AnyCard }>;
  canBeDestroyed: Interceptable<boolean>;
  canReceiveModifier: Interceptable<boolean, { modifier: Modifier<Unit> }>;
  canUseAbility: Interceptable<boolean, { ability: Ability<AnyUnitCard> }>;
  shouldDeactivateWhenSummoned: Interceptable<boolean>;

  maxHp: Interceptable<number>;
  attack: Interceptable<number>;
  spellpower: Interceptable<number>;
  movementReach: Interceptable<number>;

  attackTargetingPattern: Interceptable<TargetingStrategy>;
  attackTargetType: Interceptable<TargetingType>;
  attackAOEShape: Interceptable<AOEShape>;
  attackCounterattackParticipants: Interceptable<CounterAttackParticipantStrategy>;

  counterattackTargetingPattern: Interceptable<TargetingStrategy>;
  counterattackTargetType: Interceptable<TargetingType>;
  counterattackAOEShape: Interceptable<AOEShape>;

  maxAttacksPerTurn: Interceptable<number>;
  maxMovementsPerTurn: Interceptable<number>;
  maxCounterattacksPerTurn: Interceptable<number>;

  player: Interceptable<Player>;

  damageDealt: Interceptable<number, { source: AnyCard; target: Unit }>;
  damageReceived: Interceptable<
    number,
    { amount: number; source: AnyCard; damage: Damage<AnyCard> }
  >;
};

export const makeUnitInterceptors = (): UnitInterceptors => {
  return {
    canMove: new Interceptable<boolean>(),
    canMoveAfterAttacking: new Interceptable<boolean>(),
    canMoveThrough: new Interceptable<boolean, { unit: Unit }>(),
    canAttack: new Interceptable<boolean, { unit: Unit }>(),
    canCounterAttack: new Interceptable<boolean, { attacker: Unit }>(),
    canBeAttackTarget: new Interceptable<boolean, { attacker: Unit }>(),
    canBeCounterattackTarget: new Interceptable<boolean, { attacker: Unit }>(),
    canBeCardTarget: new Interceptable<boolean, { card: AnyCard }>(),
    canBeDestroyed: new Interceptable<boolean>(),
    canReceiveModifier: new Interceptable<boolean, { modifier: Modifier<Unit> }>(),
    canUseAbility: new Interceptable<boolean, { ability: Ability<AnyUnitCard> }>(),

    shouldDeactivateWhenSummoned: new Interceptable<boolean>(),

    maxHp: new Interceptable<number>(),
    attack: new Interceptable<number>(),
    spellpower: new Interceptable<number>(),
    movementReach: new Interceptable<number>(),

    attackTargetingPattern: new Interceptable<TargetingStrategy>(),
    attackTargetType: new Interceptable<TargetingType>(),
    attackAOEShape: new Interceptable<AOEShape>(),
    attackCounterattackParticipants:
      new Interceptable<CounterAttackParticipantStrategy>(),

    counterattackTargetingPattern: new Interceptable<TargetingStrategy>(),
    counterattackTargetType: new Interceptable<TargetingType>(),
    counterattackAOEShape: new Interceptable<AOEShape>(),

    maxAttacksPerTurn: new Interceptable<number>(),
    maxMovementsPerTurn: new Interceptable<number>(),
    maxCounterattacksPerTurn: new Interceptable<number>(),

    player: new Interceptable<Player>(),

    damageDealt: new Interceptable<number, { source: AnyCard; target: Unit }>(),
    damageReceived: new Interceptable<
      number,
      { amount: number; source: AnyCard; damage: Damage<AnyCard> }
    >()
  };
};
