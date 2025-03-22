import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { DisarmedModifier } from '../../../../modifier/modifiers/disarmed.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { AbilityBlueprint } from '../../../card-blueprint';
import { RARITIES, CARD_SETS, CARD_KINDS } from '../../../card.enums';
import { RangedFollowup } from '../../../followups/ranged-followup';
import { acolyte } from '../heroes/acolyte';

export const pacify: AbilityBlueprint = {
  id: 'pacify',
  name: 'Pacify',
  getDescription(game, card) {
    return `Inflict Disarmed(${1 + card.unit.abilityPower}) to an enemy.`;
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
    return new PointAOEShape(game, card.unit.player, TARGETING_TYPE.ALLY);
  },
  onPlay(game, card, cells, targets) {
    const target = targets[0];
    if (target) {
      target.addModifier(new DisarmedModifier(game, card, 1 + card.unit.abilityPower));
    }
  }
};
