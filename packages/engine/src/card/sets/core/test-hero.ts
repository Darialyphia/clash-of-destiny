import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../../targeting/targeting-strategy';
import type { UnitBlueprint } from '../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_JOBS,
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  UNIT_KINDS
} from '../../card.enums';
import { NoFollowup } from '../../followups/no-followup';

export const testHero: UnitBlueprint = {
  id: 'test-hero',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.HERO,
  affinity: AFFINITIES.NORMAL,
  name: 'Test Hero',
  getDescription: () => {
    return ``;
  },
  staticDescription: ``,
  setId: CARD_SETS.CORE,
  cardIconId: 'placeholder',
  spriteId: 'aiden-lv1',
  spriteParts: {},
  rarity: RARITIES.RARE,
  collectable: true,
  destinyCost: 1,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  abilities: [],
  atk: 1,
  maxHp: 18,
  spellpower: 0,
  level: 1,
  job: CARD_JOBS.AVENGER,
  lineage: 'Aiden',
  getFollowup: () => {
    return new NoFollowup();
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT);
  },
  onPlay(game, card) {}
};
