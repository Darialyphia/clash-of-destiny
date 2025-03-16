import type { Values } from '@game/shared';

export const INTERACTABLE_EVENTS = {
  BEFORE_ENTER: 'before_enter',
  AFTER_ENTER: 'after_enter',
  BEFORE_LEAVE: 'before_leave',
  AFTER_LEAVE: 'after_leave',
  CREATED: 'created',
  BEFORE_DESTROY: 'before_destroy',
  AFTER_DESTROY: 'after_destroy'
} as const;
export type CardEvent = Values<typeof INTERACTABLE_EVENTS>;
