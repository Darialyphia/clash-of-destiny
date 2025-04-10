import type { Values } from '@game/shared';

export const GAME_PHASES = {
  DRAW: 'draw',
  DESTINY: 'destiny',
  MAIN: 'main',
  GAME_END: 'game_end'
} as const;
export type GamePhase = Values<typeof GAME_PHASES>;

export const GAME_PHASE_EVENTS = {
  TURN_START: 'game_phase_turn_start',
  TURN_END: 'game_phase_turn_end',
  BEFORE_CHANGE_PHASE: 'game_phase_before_change_phase',
  AFTER_CHANGE_PHASE: 'game_phase_after_change_phase',
  OVERDRIVE_MODE: 'game_phase_overdrive_mode'
} as const;
export type GamePhaseEventName = Values<typeof GAME_PHASE_EVENTS>;
