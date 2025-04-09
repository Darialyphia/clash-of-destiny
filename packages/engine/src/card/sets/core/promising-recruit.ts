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
import { MinionFollowup } from '../../followups/minion.followup';

export const promisingRecruit: UnitBlueprint = {
  id: 'promising-recruit',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.MINION,
  affinity: AFFINITIES.NORMAL,
  name: 'Promising Recruit',
  getDescription: () => {
    return ``;
  },
  staticDescription: ``,
  setId: CARD_SETS.CORE,
  cardIconId: 'unit-promising-recruit',
  spriteId: 'promising-recruit',
  spriteParts: {},
  rarity: RARITIES.COMMON,
  collectable: true,
  manaCost: 2,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  abilities: [],
  atk: 1,
  maxHp: 2,
  job: CARD_JOBS.GUARDIAN,
  getFollowup: () => {
    return new MinionFollowup();
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT);
  },
  onInit() {},
  onPlay(game, card) {}
};
