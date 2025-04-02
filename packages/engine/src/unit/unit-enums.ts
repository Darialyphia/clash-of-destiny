import type { Values } from '@game/shared';

export const UNIT_EVENTS = {
  CREATED: 'created',
  BEFORE_MOVE: 'before_move',
  AFTER_MOVE: 'after_move',
  BEFORE_TELEPORT: 'before_teleport',
  AFTER_TELEPORT: 'after_teleport',
  BEFORE_ATTACK: 'before_attack',
  AFTER_ATTACK: 'after_attack',
  BEFORE_DEAL_DAMAGE: 'before_deal_damage',
  AFTER_DEAL_DAMAGE: 'after_deal_damage',
  BEFORE_RECEIVE_DAMAGE: 'before_receive_damage',
  AFTER_RECEIVE_DAMAGE: 'after_receive_damage',
  BEFORE_RECEIVE_HEAL: 'before_receive_heal',
  AFTER_RECEIVE_HEAL: 'after_receive_heal',
  BEFORE_DESTROY: 'before_destroy',
  AFTER_DESTROY: 'after_destroy',
  START_TURN: 'start_turn',
  END_TURN: 'end_turn',
  BEFORE_LEVEL_UP: 'before_level_up',
  AFTER_LEVEL_UP: 'after_level_up'
} as const;

export type UnitEvent = Values<typeof UNIT_EVENTS>;
