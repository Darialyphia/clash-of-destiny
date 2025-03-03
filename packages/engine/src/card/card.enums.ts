import type { Values } from '@game/shared';

export const CARD_EVENTS = {
  BEFORE_PLAY: 'before_play',
  AFTER_PLAY: 'after_play',
  DISCARD: 'discard',
  ADD_TO_HAND: 'add_to_hand',
  REPLACE: 'replace'
} as const;
export type CardEvent = Values<typeof CARD_EVENTS>;

export const CARD_KINDS = {
  UNIT: 'UNIT',
  ABILITY: 'ABILITY',
  ARTIFACT: 'ARTIFACT',
  QUEST: 'QUEST'
} as const;
export type CardKind = Values<typeof CARD_KINDS>;

export const UNIT_KINDS = {
  MINION: 'MINION',
  HERO: 'HERO'
} as const;
export type UnitKind = Values<typeof UNIT_KINDS>;

export const ARTIFACT_KINDS = {
  WEAPON: 'WEAPON',
  ARMOR: 'ARMOR',
  RELIC: 'RELIC'
} as const;
export type ArtifactKind = Values<typeof ARTIFACT_KINDS>;

export const CARD_SETS = {
  CORE: 'CORE'
} as const;

export type CardSetId = Values<typeof CARD_SETS>;

export const RARITIES = {
  BASIC: 'basic',
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
  TOKEN: 'token'
} as const;

export type Rarity = Values<typeof RARITIES>;
