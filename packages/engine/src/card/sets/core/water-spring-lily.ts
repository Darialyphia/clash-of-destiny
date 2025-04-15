import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import { DurationModifierMixin } from '../../../modifier/mixins/duration.mixin';
import { UnitInterceptorModifierMixin } from '../../../modifier/mixins/interceptor.mixin';
import { Modifier } from '../../../modifier/modifier.entity';
import { TARGETING_TYPE } from '../../../targeting/targeting-strategy';
import type { Unit } from '../../../unit/entities/unit.entity';
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
import { AnywhereFollowup } from '../../followups/anywhere-followup';
import { MinionFollowup } from '../../followups/minion.followup';

export const waterSpringLily: UnitBlueprint = {
  id: 'water-spring-lily',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.MINION,
  affinity: AFFINITIES.WATER,
  name: 'Water Spring Lily',
  getDescription: () => {
    return ``;
  },
  staticDescription: ``,
  setId: CARD_SETS.CORE,
  cardIconId: 'unit-water-spring-lily',
  spriteId: 'water-spring-lilly',
  spriteParts: {},
  rarity: RARITIES.RARE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  collectable: true,
  manaCost: 2,
  atk: 1,
  maxHp: 2,
  abilities: [
    {
      id: 'water-spring-lily',
      isCardAbility: false,
      staticDescription:
        '@[exhaust]@ : Target minion cannot attack until your next turn.',
      getDescription() {
        return `@[exhaust]@ : Target minion cannot attack until your next turn.`;
      },
      label: 'Prevent attack',
      manaCost: 0,
      shouldExhaust: true,
      canUse() {
        return true;
      },
      getFollowup() {
        return new AnywhereFollowup({
          targetingType: TARGETING_TYPE.UNIT,
          skippable: true
        });
      },
      onResolve(game, card, targets) {
        const [target] = targets;
        if (!target) return;
        const unit = game.unitSystem.getUnitAt(target.cell);
        if (!unit) return;
        unit.addModifier(
          new Modifier<Unit>('water-spring-lily-debuff', game, card, {
            stackable: false,
            name: 'Disarmed',
            description: 'Cannot attack',
            icon: 'keyword-disarmed',
            mixins: [
              new DurationModifierMixin(game, 2),
              new UnitInterceptorModifierMixin(game, {
                key: 'canAttack',
                interceptor: () => false
              })
            ]
          })
        );
      }
    }
  ],
  job: CARD_JOBS.SUMMONER,
  getFollowup: () => {
    return new MinionFollowup();
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT);
  },
  onInit() {},
  onPlay() {}
};
