import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { AbilityDamage } from '../../../../combat/damage';
import { UnitSelfEventModifierMixin } from '../../../../modifier/mixins/self-event.mixin';
import { UntilSelfTurnEndModifierMixin } from '../../../../modifier/mixins/until-self-turn-end.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { Unit } from '../../../../unit/entities/unit.entity';
import { UNIT_EVENTS } from '../../../../unit/unit-enums';
import type { AbilityBlueprint } from '../../../card-blueprint';
import { RARITIES, CARD_SETS, CARD_KINDS } from '../../../card.enums';
import { RangedFollowup } from '../../../followups/ranged-followup';
import { acolyte } from '../heroes/acolyte';

export const penance: AbilityBlueprint = {
  id: 'penance',
  name: 'Penance',
  getDescription(game, card) {
    return `Give an enemy "When this attacks, take 1 damage" until the end of its next turn.`;
  },
  cardIconId: 'placeholder',
  rarity: RARITIES.COMMON,
  setId: CARD_SETS.CORE,
  kind: CARD_KINDS.ABILITY,
  manaCost: 2,
  levelCost: 1,
  exp: 1,
  classIds: [acolyte.id],
  getFollowup() {
    return new RangedFollowup({
      minRange: 0,
      maxRange: 3,
      targetsCount: 1,
      targetingType: TARGETING_TYPE.ENEMY
    });
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.unit.player, TARGETING_TYPE.ENEMY);
  },
  onPlay(game, card, cells, targets) {
    const [target] = targets;
    if (target) {
      target.addModifier(
        new Modifier('penance', game, card, {
          stackable: false,
          name: 'Penance',
          description: 'Takes 1 damage whenever this attacks.',
          icon: 'keyword-splash-attack',
          mixins: [
            new UnitSelfEventModifierMixin(game, {
              eventName: UNIT_EVENTS.AFTER_ATTACK,
              handler() {
                card.unit.takeDamage(
                  card.unit,
                  new AbilityDamage({ baseAmount: 1, source: card })
                );
              }
            }),
            new UntilSelfTurnEndModifierMixin(game)
          ]
        })
      );
    }
  }
};
