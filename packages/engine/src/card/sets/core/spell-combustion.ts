import { PointAOEShape } from '../../../aoe/point.aoe-shape';
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
import { SpellDamage } from '../../../combat/damage';
import { CompositeAOEShape } from '../../../aoe/composite.aoe-shape';
import { RingAOEShape } from '../../../aoe/ring.aoe-shape';

export const combustion: SpellBlueprint = {
  id: 'combustion',
  kind: CARD_KINDS.SPELL,
  affinity: AFFINITIES.FIRE,
  name: 'Combustion',
  getDescription: () => {
    return `Deal 3 damage to a minion ans 2 damae to all nearby units.`;
  },
  staticDescription: `Deal 3 damage to a minion and 2 damage to all nearby units.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'spell-eternal-flame',
  rarity: RARITIES.EPIC,
  collectable: true,
  manaCost: 5,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  job: CARD_JOBS.SPELLCASTER,
  abilities: [],
  getFollowup: () => {
    return new AnywhereFollowup({ targetingType: TARGETING_TYPE.MINION });
  },
  getAoe(game, card) {
    return new CompositeAOEShape([
      {
        shape: new PointAOEShape(game, card.player, TARGETING_TYPE.MINION),
        getPoints(points) {
          return points;
        }
      },
      {
        shape: new RingAOEShape(game, card.player, {
          targetingType: TARGETING_TYPE.UNIT
        }),
        getPoints(points) {
          return points;
        }
      }
    ]);
  },
  onInit() {},
  onPlay(game, card, affectedCells, affectedUnits) {
    const mainTarget = affectedUnits[0];
    if (!mainTarget) return;
    mainTarget.takeDamage(card, new SpellDamage({ source: card, baseAmount: 3 }));
    const nearbyTargets = affectedUnits.slice(1);
    nearbyTargets.forEach(target => {
      target.takeDamage(card, new SpellDamage({ source: card, baseAmount: 2 }));
    });
  }
};
