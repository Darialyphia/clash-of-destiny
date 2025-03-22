import { RingAOEShape } from '../../../../aoe/ring.aoe-shape';
import { AbilityDamage } from '../../../../combat/damage';
import { RootedModifier } from '../../../../modifier/modifiers/rooted.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { AbilityBlueprint } from '../../../card-blueprint';
import { RARITIES, CARD_SETS, CARD_KINDS } from '../../../card.enums';
import { SelfFollowup } from '../../../followups/self-followup';
import { mage } from '../heroes/mage';

export const frostNova: AbilityBlueprint = {
  id: 'frost-nova',
  name: 'Frost Nova',
  getDescription(game, card) {
    return `Deal 1 damage and inflict Rooted(${2 + card.unit.abilityPower}) to nearby enemies.`;
  },
  cardIconId: 'card-frost-nova',
  rarity: RARITIES.RARE,
  setId: CARD_SETS.CORE,
  kind: CARD_KINDS.ABILITY,
  manaCost: 3,
  levelCost: 1,
  exp: 1,
  classIds: [mage.id],
  getFollowup() {
    return new SelfFollowup();
  },
  getAoe(game, card) {
    return new RingAOEShape(game, card.unit.player, {
      targetingType: TARGETING_TYPE.ENEMY
    });
  },
  onPlay(game, card, cells, targets) {
    targets.forEach(target => {
      target.takeDamage(
        card.unit,
        new AbilityDamage({
          baseAmount: 1,
          source: card
        })
      );

      target.addModifier(new RootedModifier(game, card, 2 + card.unit.abilityPower));
    });
  }
};
