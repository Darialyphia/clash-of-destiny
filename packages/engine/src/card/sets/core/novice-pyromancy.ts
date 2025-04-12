import { CompositeAOEShape } from '../../../aoe/composite.aoe-shape';
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
import { OverheatModifier } from '../../../modifier/modifiers/overheat.modifier';

export const novicePyromancy: SpellBlueprint = {
  id: 'novice-pyromancy',
  kind: CARD_KINDS.SPELL,
  affinity: AFFINITIES.FIRE,
  name: 'Novice Pyromancy',
  getDescription: () => {
    return `Give @Overheat(1)@ to a unit. Draw a card.`;
  },
  staticDescription: `Give @Overheat(1)@ to a unit. Draw a card.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'spell-novice-pyromancy',
  rarity: RARITIES.COMMON,
  collectable: true,
  manaCost: 1,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  job: CARD_JOBS.SPELLCASTER,
  abilities: [],
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

    target.addModifier(new OverheatModifier(game, card));

    card.player.cards.draw(1);
  }
};
