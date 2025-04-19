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
import { Modifier } from '../../../modifier/modifier.entity';
import { SpellCardInterceptorModifierMixin } from '../../../modifier/mixins/interceptor.mixin';

export const petalBlade: SpellBlueprint = {
  id: 'petal-blade',
  kind: CARD_KINDS.SPELL,
  affinity: AFFINITIES.NORMAL,
  name: 'Petal Blade',
  getDescription: () => {
    return `Deal 1 damage to a unit. Cannot be banished for Destiny.`;
  },
  staticDescription: `Deal 1 damage to a unit. Cannot be banished for Destiny.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'spell-petal-blade',
  rarity: RARITIES.COMMON,
  collectable: false,
  manaCost: 0,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  job: CARD_JOBS.WANDERER,
  abilities: [],
  getFollowup: () => {
    return new AnywhereFollowup({ targetingType: TARGETING_TYPE.UNIT });
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT);
  },
  onInit(game, card) {
    card.addModifier(
      new Modifier('petal-blade', game, card, {
        stackable: false,
        name: 'Petal Blade',
        description: 'Cannot be banished for Destiny.',
        mixins: [
          new SpellCardInterceptorModifierMixin(game, {
            key: 'canBeBanishedForDestiny',
            interceptor: () => false
          })
        ]
      })
    );
  },
  onPlay(game, card, affectedCells, affectedUnits) {
    const [target] = affectedUnits;
    if (!target) return;
    target.takeDamage(card, new SpellDamage({ source: card, baseAmount: 1 }));
  }
};
