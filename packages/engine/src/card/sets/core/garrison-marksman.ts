import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import { RangedModifier } from '../../../modifier/modifiers/ranged.modiier';
import { TARGETING_TYPE } from '../../../targeting/targeting-strategy';
import { floatingDestiny } from '../../abilities/floating-destiny';
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

export const garrisonMarksman: UnitBlueprint = {
  id: 'garrison-marksman',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.MINION,
  affinity: AFFINITIES.NORMAL,
  name: 'Garrison Marksman',
  getDescription: () => {
    return `@Ranged(2)@.`;
  },
  staticDescription: `@Ranged(2)@.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'unit-garrison-marksman',
  spriteId: 'garrison-marksman',
  spriteParts: {},
  rarity: RARITIES.COMMON,
  collectable: true,
  manaCost: 2,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  abilities: [],
  atk: 1,
  maxHp: 1,
  job: CARD_JOBS.AVENGER,
  getFollowup: () => {
    return new MinionFollowup();
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT);
  },
  onInit() {},
  onPlay(game, card) {
    card.unit.addModifier(new RangedModifier(game, card, { range: 2 }));
  }
};
