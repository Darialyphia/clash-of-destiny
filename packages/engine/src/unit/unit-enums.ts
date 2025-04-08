import type { Values } from '@game/shared';

export const UNIT_EVENTS = {
  CREATED: 'created',
  BEFORE_MOVE: 'before_move',
  AFTER_MOVE: 'after_move',
  BEFORE_TELEPORT: 'before_teleport',
  AFTER_TELEPORT: 'after_teleport',
  BEFORE_ATTACK: 'before_attack',
  AFTER_ATTACK: 'after_attack',
  BEFORE_COUNTERATTACK: 'before_counterattack',
  AFTER_COUNTERATTACK: 'after_counterattack',
  BEFORE_DEAL_DAMAGE: 'before_deal_damage',
  AFTER_DEAL_DAMAGE: 'after_deal_damage',
  BEFORE_RECEIVE_DAMAGE: 'before_receive_damage',
  AFTER_RECEIVE_DAMAGE: 'after_receive_damage',
  BEFORE_RECEIVE_HEAL: 'before_receive_heal',
  AFTER_RECEIVE_HEAL: 'after_receive_heal',
  BEFORE_DESTROY: 'before_destroy',
  AFTER_DESTROY: 'after_destroy',
  BEFORE_BOUNCE: 'before_bounce',
  AFTER_BOUNCE: 'after_bounce',
  BEFORE_EXHAUST: 'before_exhaust',
  AFTER_EXHAUST: 'after_exhaust',
  BEFORE_WAKE_UP: 'before_wake_up',
  AFTER_WAKE_UP: 'after_wake_up',
  BEFORE_USE_ABILITY: 'before_use_ability',
  AFTER_USE_ABILITY: 'after_use_ability',
  BEFORE_EVOLVE_HERO: 'before_evolve_hero',
  AFTER_EVOLVE_HERO: 'after_evolve_hero'
} as const;

export type UnitEvent = Values<typeof UNIT_EVENTS>;
