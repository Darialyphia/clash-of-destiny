import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { AbilityBlueprint } from '../../../card-blueprint';
import { RARITIES, CARD_SETS, CARD_KINDS } from '../../../card.enums';
import { RangedFollowup } from '../../../followups/ranged-followup';
import { acolyte } from '../heroes/acolyte';

export const cureWounds: AbilityBlueprint = {
  id: 'cure-wounds',
  name: 'Cure Wounds',
  getDescription(game, card) {
    return `Heal an ally for ${2 + card.unit.abilityPower}.`;
  },
  cardIconId: 'card-cure-wounds',
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
      maxRange: 4,
      targetsCount: 1,
      targetingType: TARGETING_TYPE.ALLY
    });
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.unit.player, TARGETING_TYPE.ALLY);
  },
  onPlay(game, card, cells, targets) {
    const target = targets[0];
    if (target) {
      target.heal(card, 2 + card.unit.abilityPower);
    }
  }
};
