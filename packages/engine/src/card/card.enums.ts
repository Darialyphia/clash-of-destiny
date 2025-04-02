import type { Values } from '@game/shared';

export const CARD_EVENTS = {
  BEFORE_PLAY: 'before_play',
  AFTER_PLAY: 'after_play',
  DISCARD: 'discard',
  ADD_TO_HAND: 'add_to_hand',
  REPLACE: 'replace'
} as const;
export type CardEvent = Values<typeof CARD_EVENTS>;

export const CARD_DECK_SOURCES = {
  MAIN_DECK: 'MAIN_DECK',
  DESTINY_DECK: 'DESTINY_DECK'
} as const;
export type CardDeckSource = Values<typeof CARD_DECK_SOURCES>;

export const CARD_KINDS = {
  UNIT: 'UNIT',
  SPELL: 'SPELL',
  SECRET: 'SECRET',
  ARTIFACT: 'ARTIFACT'
} as const;
export type CardKind = Values<typeof CARD_KINDS>;

export const CARD_JOBS = {
  BRAWLER: 'BRAWLER',
  AVENGER: 'AVENGER',
  GUARDIAN: 'GUARDIAN',
  SPELLCASTER: 'SPELLCASTER',
  WANDERER: 'WANDERER',
  SUMMONER: 'SUMMONER'
};
export type CardJob = Values<typeof CARD_JOBS>;

export const UNIT_KINDS = {
  MINION: 'MINION',
  SHRINE: 'SHRINE',
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
