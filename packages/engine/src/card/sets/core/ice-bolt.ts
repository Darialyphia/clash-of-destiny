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
import { FrozenModifier } from '../../../modifier/modifiers/frozen-modifier';

export const iceBolt: SpellBlueprint = {
  id: 'ice-bolt',
  kind: CARD_KINDS.SPELL,
  affinity: AFFINITIES.WATER,
  name: 'Ice Bolt',
  getDescription: () => {
    return `@Freeze@ a minion.`;
  },
  staticDescription: `@Freeze@ a minion.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'spell-ice-bolt',
  rarity: RARITIES.COMMON,
  collectable: true,
  manaCost: 1,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  job: CARD_JOBS.SPELLCASTER,
  abilities: [],
  getFollowup: () => {
    return new AnywhereFollowup({ targetingType: TARGETING_TYPE.ENEMY_MINION });
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.player, TARGETING_TYPE.ENEMY_MINION);
  },
  onInit() {},
  onPlay(game, card, affectedCells, affectedUnits) {
    const [target] = affectedUnits;
    if (!target) return;
    target.addModifier(new FrozenModifier(game, card));
  }
};
