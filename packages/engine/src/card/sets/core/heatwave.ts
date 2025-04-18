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
import { OverheatModifier } from '../../../modifier/modifiers/overheat.modifier';
import { EverywhereAOEShape } from '../../../aoe/everywhere.aoe-shape';
import { floatingDestiny } from '../../abilities/floating-destiny';

export const heatWave: SpellBlueprint = {
  id: 'heat wave',
  kind: CARD_KINDS.SPELL,
  affinity: AFFINITIES.FIRE,
  name: 'Heat Wave',
  getDescription: () => {
    return `Give @Overheat(1)@ to all minions.`;
  },
  staticDescription: `Give @Overheat(1)@ to all minions.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'spell-heatwave',
  rarity: RARITIES.RARE,
  collectable: true,
  manaCost: 2,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  job: CARD_JOBS.SPELLCASTER,
  abilities: [floatingDestiny],
  getFollowup: () => {
    return new AnywhereFollowup({ targetingType: TARGETING_TYPE.ANYWHERE });
  },
  getAoe(game, card) {
    return new EverywhereAOEShape(game, card.player, TARGETING_TYPE.MINION);
  },
  onInit() {},
  onPlay(game, card, affectedCells, affectedUnits) {
    affectedUnits.forEach(unit => {
      unit.addModifier(new OverheatModifier(game, card));
    });
  }
};
