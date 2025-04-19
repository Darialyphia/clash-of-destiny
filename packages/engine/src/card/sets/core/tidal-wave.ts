import { CompositeAOEShape } from '../../../aoe/composite.aoe-shape';
import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import { RowAOEShape } from '../../../aoe/row.aoe-shape';
import { SpellDamage } from '../../../combat/damage';
import { TARGETING_TYPE } from '../../../targeting/targeting-strategy';
import type { SpellBlueprint } from '../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_JOBS,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../card.enums';
import { AnywhereFollowup } from '../../followups/anywhere-followup';
import { MultiTargetFollowup } from '../../followups/multi-target-followup';
import { RangedFollowup } from '../../followups/ranged-followup';

export const tidalWave: SpellBlueprint = {
  id: 'tidal-wave',
  kind: CARD_KINDS.SPELL,
  affinity: AFFINITIES.WATER,
  name: 'Storm Flash',
  getDescription: () => {
    return `Deal 3 damage to all units on a row.`;
  },
  staticDescription: `Deal 3 damage to all units on a row.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'spell-tidal-wave',
  rarity: RARITIES.EPIC,
  collectable: true,
  manaCost: 4,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  job: CARD_JOBS.AVENGER,
  abilities: [],
  getFollowup: () => {
    return new AnywhereFollowup({ targetingType: TARGETING_TYPE.ANYWHERE });
  },
  getAoe(game, card) {
    return new RowAOEShape(game, card.player, { targetingType: TARGETING_TYPE.UNIT });
  },
  onInit() {},
  onPlay(game, card, affectedCells, affectedUnits) {
    affectedUnits.forEach(unit => {
      unit.takeDamage(card, new SpellDamage({ source: card, baseAmount: 3 }));
    });
  }
};
