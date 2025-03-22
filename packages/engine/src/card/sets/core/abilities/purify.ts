import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { AbilityDamage } from '../../../../combat/damage';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { AbilityBlueprint } from '../../../card-blueprint';
import { RARITIES, CARD_SETS, CARD_KINDS } from '../../../card.enums';
import { RangedFollowup } from '../../../followups/ranged-followup';
import { acolyte } from '../heroes/acolyte';

export const purify: AbilityBlueprint = {
  id: 'purify',
  name: 'Purify',
  getDescription() {
    return `Remove negative status effects from an ally.`;
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
      maxRange: 2,
      targetsCount: 1,
      targetingType: TARGETING_TYPE.ALLY
    });
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.unit.player, TARGETING_TYPE.ALLY);
  },
  onPlay(game, card, cells, targets) {
    const target = targets[0];
    target.modifiers.forEach(modifier => {
      if (!modifier.source.player.equals(card.unit.player)) {
        target.removeModifier(modifier);
      }
    });
  }
};
