import { CompositeAOEShape } from '../../../aoe/composite.aoe-shape';
import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../../targeting/targeting-strategy';
import { floatingDestiny } from '../../abilities/floating-destiny';
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
import { SpellDamage } from '../../../combat/damage';

export const spark: SpellBlueprint = {
  id: 'spark',
  kind: CARD_KINDS.SPELL,
  affinity: AFFINITIES.FIRE,
  name: 'Spark',
  getDescription: () => {
    return `Deal 1 damage to a unit.`;
  },
  staticDescription: `Deal 1 damage to a unit.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'spell-spark',
  rarity: RARITIES.COMMON,
  collectable: true,
  manaCost: 1,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  job: CARD_JOBS.SPELLCASTER,
  abilities: [floatingDestiny],
  getFollowup: () => {
    return new AnywhereFollowup({ targetingType: TARGETING_TYPE.UNIT });
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT);
  },
  onInit() {},
  onPlay(game, card, affectedCells, affectedUnits) {
    const [target] = affectedUnits;
    if (!target) return;
    target.takeDamage(card, new SpellDamage({ source: card, baseAmount: 1 }));
  }
};
