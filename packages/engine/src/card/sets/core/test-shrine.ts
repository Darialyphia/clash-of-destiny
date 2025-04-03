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

export const testShrine: UnitBlueprint = {
  id: 'test-shrine',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.SHRINE,
  name: 'Test Shrine',
  getDescription: () => {
    return `On Enter: draw 5 cards.`;
  },
  staticDescription: `On Enter: draw 5 cards.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'placeholder',
  spriteId: 'fire-shrine-of-knowledge',
  spriteParts: {},
  rarity: RARITIES.COMMON,
  collectable: true,
  destinyCost: 0,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  abilities: [],
  atk: 1,
  maxHp: 2,
  level: 0,
  getFollowup: () => {
    return new NoFollowup();
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT);
  },
  onPlay(game, card) {
    card.player.cards.draw(5);
  }
};
