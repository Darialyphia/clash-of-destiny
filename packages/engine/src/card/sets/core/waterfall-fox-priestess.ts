import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import { ElusiveModifier } from '../../../modifier/modifiers/elusive.modifier';
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

export const waterfallFoxPriestess: UnitBlueprint = {
  id: 'waterfall-fox-priestess',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.MINION,
  affinity: AFFINITIES.WATER,
  name: 'Waterfall Fox Priestess',
  getDescription: () => {
    return `@Elusive@.`;
  },
  staticDescription: `@Elusive@.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'unit-waterfall-fox-priestess',
  spriteId: 'waterfall-fox-priestess',
  spriteParts: {},
  rarity: RARITIES.RARE,
  collectable: true,
  manaCost: 3,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  abilities: [],
  atk: 2,
  maxHp: 2,
  job: CARD_JOBS.WANDERER,
  getFollowup: () => {
    return new MinionFollowup();
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT);
  },
  onInit() {},
  onPlay(game, card) {
    card.unit.addModifier(new ElusiveModifier(game, card));
  }
};
