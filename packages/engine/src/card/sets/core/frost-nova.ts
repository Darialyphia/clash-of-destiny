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
import { RingAOEShape } from '../../../aoe/ring.aoe-shape';
import { FrozenModifier } from '../../../modifier/modifiers/frozen-modifier';

export const frostNova: SpellBlueprint = {
  id: 'frost-nova',
  kind: CARD_KINDS.SPELL,
  affinity: AFFINITIES.WATER,
  name: 'Frost Nova',
  getDescription: () => {
    return `@Freeze@ units nearby your Hero and deal 1 damage to them.`;
  },
  staticDescription: `@Freeze@ units nearby your Hero and deal 1 damage to them.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'spell-frost-nova',
  rarity: RARITIES.EPIC,
  collectable: true,
  manaCost: 4,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  job: CARD_JOBS.SPELLCASTER,
  abilities: [],
  getFollowup: () => {
    return new AnywhereFollowup({ targetingType: TARGETING_TYPE.ALLY_HERO });
  },
  getAoe(game, card) {
    return new RingAOEShape(game, card.player, {
      targetingType: TARGETING_TYPE.ENEMY_UNIT,
      origin: card.player.hero.position
    });
  },
  onInit() {},
  onPlay(game, card, affectedCells, affectedUnits) {
    affectedUnits.forEach(unit => {
      unit.takeDamage(card, new SpellDamage({ source: card, baseAmount: 1 }));
      unit.addModifier(new FrozenModifier(game, card));
    });
  }
};
