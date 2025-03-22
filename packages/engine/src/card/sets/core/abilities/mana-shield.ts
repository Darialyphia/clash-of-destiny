import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { UnitInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { UnitSelfEventModifierMixin } from '../../../../modifier/mixins/self-event.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import { UNIT_EVENTS } from '../../../../unit/unit-enums';
import type { AbilityBlueprint } from '../../../card-blueprint';
import { RARITIES, CARD_SETS, CARD_KINDS } from '../../../card.enums';
import { SelfFollowup } from '../../../followups/self-followup';
import { mage } from '../heroes/mage';

export const manaShield: AbilityBlueprint = {
  id: 'mana-shield',
  name: 'Mana Shield',
  getDescription(game, card) {
    return `The next time this takes damage, reduce the damage by ${2 + card.unit.abilityPower} and lose 1 mana.`;
  },
  cardIconId: 'card-mana-shield',
  rarity: RARITIES.RARE,
  setId: CARD_SETS.CORE,
  kind: CARD_KINDS.ABILITY,
  manaCost: 1,
  levelCost: 1,
  exp: 1,
  classIds: [mage.id],
  getFollowup() {
    return new SelfFollowup();
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.player, TARGETING_TYPE.ALLY);
  },
  onPlay(game, card) {
    const modifierId = 'magic-shield';
    const power = 2 + card.unit.abilityPower;

    card.unit.addModifier(
      new Modifier(modifierId, game, card, {
        name: 'Magic Shield',
        description:
          'The next time this takes damage, reduce the damage by 2 and lose 1 mana.',
        icon: 'modifier-mana-shield',
        stackable: false,
        mixins: [
          new UnitInterceptorModifierMixin(game, {
            key: 'damageReceived',
            interceptor(value) {
              if (card.unit.mp.current < 1) {
                return value;
              }

              return value - power;
            }
          }),
          new UnitSelfEventModifierMixin(game, {
            eventName: UNIT_EVENTS.AFTER_RECEIVE_DAMAGE,
            handler() {
              card.unit.mp.remove(1);
              card.unit.removeModifier(modifierId);
            },
            once: true
          })
        ]
      })
    );
  }
};
