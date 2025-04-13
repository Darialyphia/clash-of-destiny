import type { Values } from '@game/shared';

export const PLAYER_EVENTS = {
  BEFORE_PLAY_CARD: 'before_play_card',
  AFTER_PLAY_CARD: 'after_play_card',
  BEFORE_DRAW: 'before_draw',
  AFTER_DRAW: 'after_draw',
  START_TURN: 'start_turn',
  END_TURN: 'end_turn',
  BEFORE_RESOURCE_ACTION_DRAW: 'before_resource_action_draw',
  AFTER_RESOURCE_ACTION_DRAW: 'after_resource_action_draw',
  BEFORE_RESOURCE_ACTION_REPLACE: 'before_resource_action_replace',
  AFTER_RESOURCE_ACTION_REPLACE: 'after_resource_action_replace',
  BEFORE_RESOURCE_ACTION_DESTINY: 'before_resource_action_gain_destiny',
  AFTER_RESOURCE_ACTION_DESTINY: 'after_resource_action_gain_destiny',
  BEFORE_TRIGGER_SECRET: 'before_trigger_secret',
  AFTER_TRIGGER_SECRET: 'after_trigger_secret'
} as const;

export type PlayerEvent = Values<typeof PLAYER_EVENTS>;
