import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../../targeting/targeting-strategy';
import type { UnitBlueprint } from '../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  UNIT_KINDS
} from '../../card.enums';
import { NoFollowup } from '../../followups/no-followup';

export const testMinion: UnitBlueprint = {
  id: 'test-minion',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.SHRINE,
  name: 'Test Minion',
  getDescription: (game, card) => {
    return `todo description`;
  },
  staticDescription: `todo static description`,
  setId: CARD_SETS.CORE,
  cardIconId: 'placeholder',
  spriteId: 'test-unit',
  spriteParts: {},
  rarity: RARITIES.COMMON,
  collectable: true,
  destinyCost: 0,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  abilities: [],
  atk: 0,
  maxHp: 15,
  level: 0,
  getFollowup: () => {
    return new NoFollowup();
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT);
  },
  onPlay() {}
};
