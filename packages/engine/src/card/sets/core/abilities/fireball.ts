import { CompositeAOEShape } from '../../../../aoe/composite.aoe-shape';
import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { RingAOEShape } from '../../../../aoe/ring.aoe-shape';
import { AbilityDamage } from '../../../../combat/damage';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { AbilityBlueprint } from '../../../card-blueprint';
import { RARITIES, CARD_SETS, CARD_KINDS } from '../../../card.enums';
import { RangedFollowup } from '../../../followups/ranged-followup';
import { mage } from '../heroes/mage';

export const fireball: AbilityBlueprint = {
  id: 'fireball',
  name: 'Fireball',
  getDescription() {
    return `Deal 2 damage to an enemy and 1 damage to enemies around it.`;
  },
  cardIconId: 'card-fireball',
  rarity: RARITIES.COMMON,
  setId: CARD_SETS.CORE,
  kind: CARD_KINDS.ABILITY,
  manaCost: 2,
  levelCost: 1,
  exp: 1,
  classIds: [mage.id],
  getFollowup() {
    return new RangedFollowup({
      minRange: 0,
      maxRange: 3,
      targetsCount: 1,
      targetingType: TARGETING_TYPE.ENEMY
    });
  },
  getAoe(game, card) {
    return new CompositeAOEShape([
      {
        shape: new PointAOEShape(game, card.unit.player, TARGETING_TYPE.ENEMY),
        getPoints(points) {
          return points;
        }
      },
      {
        shape: new RingAOEShape(game, card.unit.player, {
          targetingType: TARGETING_TYPE.ENEMY
        }),
        getPoints(points) {
          return points;
        }
      }
    ]);
  },
  onPlay(game, card, cells, targets) {
    const [target, ...nearbyTargets] = targets;
    target.takeDamage(card.unit, new AbilityDamage({ baseAmount: 2, source: card }));
    nearbyTargets.forEach(nearbyTarget => {
      nearbyTarget.takeDamage(
        card.unit,
        new AbilityDamage({ baseAmount: 1, source: card })
      );
    });
  }
};
