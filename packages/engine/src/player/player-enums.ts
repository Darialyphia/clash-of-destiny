import type { Values } from '@game/shared';

export const PLAYER_EVENTS = {
  BEFORE_PLAY_CARD: 'before_play_card',
  AFTER_PLAY_CARD: 'after_play_card',
  BEFORE_DRAW: 'before_draw',
  AFTER_DRAW: 'after_draw',
  START_TURN: 'start_turn',
  END_TURN: 'end_turn'
} as const;

export type PlayerEvent = Values<typeof PLAYER_EVENTS>;
