import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../../targeting/targeting-strategy';
import type { UnitBlueprint } from '../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_JOBS,
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  UNIT_KINDS
} from '../../card.enums';
import { MinionFollowup } from '../../followups/minion.followup';

export const testMinion: UnitBlueprint = {
  id: 'test-minion',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.MINION,
  name: 'Test Minion',
  getDescription: (game, card) => {
    return `todo description`;
  },
  staticDescription: `todo static description`,
  setId: CARD_SETS.CORE,
  cardIconId: 'card-test-minion',
  spriteId: 'test-unit',
  spriteParts: {},
  rarity: RARITIES.COMMON,
  collectable: true,
  manaCost: 2,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  abilities: [],
  atk: 1,
  maxHp: 2,
  job: CARD_JOBS.FIGHTER,
  getFollowup: () => {
    return new MinionFollowup();
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT);
  },
  onPlay() {}
};
