import { NoAOEShape } from '../../../../aoe/no-aoe.aoe-shape';
import { UnitInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { UNIT_EVENTS } from '../../../../unit/unit-enums';
import type { AbilityBlueprint } from '../../../card-blueprint';
import { RARITIES, CARD_SETS, CARD_KINDS } from '../../../card.enums';
import { SelfFollowup } from '../../../followups/self-followup';
import { mage } from '../heroes/mage';

export const magicAmplification: AbilityBlueprint = {
  id: 'magic-amplification',
  name: 'Magic Amplification',
  getDescription() {
    return `Your next ability is cast with +2 Ability Power.`;
  },
  cardIconId: 'card-magic-amplification',
  rarity: RARITIES.COMMON,
  setId: CARD_SETS.CORE,
  kind: CARD_KINDS.ABILITY,
  manaCost: 1,
  levelCost: 1,
  exp: 1,
  classIds: [mage.id],
  getFollowup() {
    return new SelfFollowup();
  },
  getAoe() {
    return new NoAOEShape();
  },
  onPlay(game, card) {
    const modifier = new Modifier('magic-amplification', game, card, {
      name: 'Magic Amplification',
      description: '+ 2 Ability Power',
      icon: 'keyword-ability-power-buff',
      stackable: true,
      initialStacks: 1,
      mixins: [
        new UnitInterceptorModifierMixin(game, {
          key: 'abilityPower',
          interceptor(value, ctx, modifier) {
            return value + modifier.stacks * 2;
          }
        })
      ]
    });

    card.unit.addModifier(modifier);

    const unsub = card.unit.on(UNIT_EVENTS.AFTER_PLAY_CARD, e => {
      if (e.data.card.equals(card)) return;

      if (e.data.card.kind === CARD_KINDS.ABILITY) {
        card.unit.removeModifier(modifier);
        unsub();
      }
    });
  }
};
