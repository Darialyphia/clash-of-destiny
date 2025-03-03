import type { Values } from '@game/shared';

export const PLAYER_EVENTS = {
  DEPLOY: 'deploy'
} as const;

export type PlayerEvent = Values<typeof PLAYER_EVENTS>;
