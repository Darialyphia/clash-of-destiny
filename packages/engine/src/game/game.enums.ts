import type { Values } from '@game/shared';

export const GAME_PHASES = {
  DRAW: 'draw',
  DESTINY: 'destiny',
  MAIN: 'main',
  GAME_END: 'end'
} as const;
export type GamePhase = Values<typeof GAME_PHASES>;

export const GAME_PHASE_EVENTS = {
  TURN_START: 'game_phase_turn_start',
  TURN_END: 'game_phase_turn_end'
} as const;
export type GamePhaseEventName = Values<typeof GAME_PHASE_EVENTS>;
