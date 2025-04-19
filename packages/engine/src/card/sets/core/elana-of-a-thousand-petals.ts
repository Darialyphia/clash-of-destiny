import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import type { UnitBlueprint } from '../../card-blueprint';
import { TARGETING_TYPE } from '../../../targeting/targeting-strategy';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_JOBS,
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  UNIT_KINDS
} from '../../card.enums';
import { NoFollowup } from '../../followups/no-followup';
import { DazzlingBloomModifier } from '../../../modifier/modifiers/dazzling-bloom.modifier';
import { AnywhereFollowup } from '../../followups/anywhere-followup';
import { SwiftModifier } from '../../../modifier/modifiers/swift.modifier';
import { ElusiveModifier } from '../../../modifier/modifiers/elusive.modifier';
import { Modifier } from '../../../modifier/modifier.entity';
import { MinionCardInterceptorModifierMixin } from '../../../modifier/mixins/interceptor.mixin';
import { UntilEndOfTurnModifierMixin } from '../../../modifier/mixins/until-end-of-turn.mixin';
import type { MinionCard } from '../../entities/minion-card.entity';

export const elanaLv3: UnitBlueprint = {
  id: 'elana-of-a-thousand-petals',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.HERO,
  affinity: AFFINITIES.HARMONY,
  name: 'Elana Of a Thousand Petals',
  getDescription: () => {
    return `@Elana Lineage@.\n@Elusive@.`;
  },
  staticDescription: `@Elana Lineage@.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'unit-elana-lv3',
  spriteId: 'elana-lv3',
  spriteParts: {},
  rarity: RARITIES.LEGENDARY,
  collectable: true,
  destinyCost: 3,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  abilities: [
    {
      id: 'elena-of-a-thousand-petals',
      getDescription() {
        return '@[exhaust]@:  Remove all stacks of Dazzling Bloom from this unit to take control of an enemy minion with Health less or equal to the stacks removed until the end of the turn.';
      },
      staticDescription:
        '@[exhaust]@: Remove all stacks of Dazzling Bloom from this unit to take control of an enemy minion with Health less or equal to the stacks removed until the end of the turn.',
      canUse(game, card) {
        if (!card.unit) return false;
        const dazzlingBloom = card.unit.getModifier(DazzlingBloomModifier);
        if (!dazzlingBloom) return false;
        const enemyMinions = card.player.enemyUnits.filter(u => u.isMinion);
        return enemyMinions.some(minion => {
          return minion.hp.current <= dazzlingBloom.stacks;
        });
      },
      getFollowup(game, card) {
        return new AnywhereFollowup({
          targetingType: TARGETING_TYPE.ENEMY_MINION,
          filter(point) {
            const unit = game.unitSystem.getUnitAt(point)!;
            const dazzlingBloom = card.unit.getModifier(DazzlingBloomModifier);
            if (!dazzlingBloom) return false;
            return unit.hp.current <= dazzlingBloom.stacks;
          }
        });
      },
      isCardAbility: false,
      label: 'Take control',
      manaCost: 0,
      shouldExhaust: true,
      onResolve(game, card, targets) {
        const dazzlingBloom = card.unit.getModifier(DazzlingBloomModifier);
        if (!dazzlingBloom) return;
        card.unit.removeModifier(dazzlingBloom, true);
        const target = targets[0];
        const unit = game.unitSystem.getUnitAt(target.cell)!;
        unit.card.addModifier(
          new Modifier<MinionCard>('elana-lv3-control', game, card, {
            stackable: false,
            mixins: [
              new UntilEndOfTurnModifierMixin(game),
              new MinionCardInterceptorModifierMixin(game, {
                key: 'player',
                interceptor: () => card.player
              })
            ]
          })
        );
      }
    }
  ],
  atk: 2,
  maxHp: 21,
  spellpower: 2,
  level: 3,
  job: CARD_JOBS.WANDERER,
  lineage: 'Elana',
  getFollowup: () => {
    return new NoFollowup();
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT);
  },
  onInit() {},
  onPlay(game, card) {
    card.unit.addModifier(new ElusiveModifier(game, card));
  }
};
