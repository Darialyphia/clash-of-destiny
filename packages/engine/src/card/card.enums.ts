import type { Values } from '@game/shared';
import { Faction } from './entities/faction.entity';

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
  SPELL: 'SPELL',
  ARTIFACT: 'ARTIFACT'
} as const;
export type CardKind = Values<typeof CARD_KINDS>;

export const UNIT_TYPES = {
  MINION: 'MINION',
  GENERAL: 'GENERAL'
} as const;
export type UnitType = Values<typeof UNIT_TYPES>;

export const CARD_SETS = {
  CORE: 'CORE'
} as const;

export type CardSetId = Values<typeof CARD_SETS>;

export const FACTION_IDS = {
  F1: 'F1',
  F2: 'F2',
  F3: 'F3',
  F4: 'F4',
  F5: 'F5',
  F6: 'F6'
} as const;

export type FactionId = Values<typeof FACTION_IDS>;

export const FACTIONS = {
  F1: new Faction(FACTION_IDS.F1, 'Lyonar'),
  F2: new Faction(FACTION_IDS.F2, 'Songhai'),
  F3: new Faction(FACTION_IDS.F3, 'Vetruvian'),
  F4: new Faction(FACTION_IDS.F4, 'Abyssian'),
  F5: new Faction(FACTION_IDS.F5, 'Magmar'),
  F6: new Faction(FACTION_IDS.F6, 'Vanar')
} as const satisfies Record<string, Faction>;

export const RARITIES = {
  BASIC: 'basic',
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
  TOKEN: 'token'
} as const;

export type Rarity = Values<typeof RARITIES>;
