import { ConeAOEShape } from '../../../../aoe/cone.aoe-shape';
import { ProjectileAOEShape } from '../../../../aoe/projectile.aoe-shape';
import { RingAOEShape } from '../../../../aoe/ring.aoe-shape';
import { AbilityDamage } from '../../../../combat/damage';
import { RootedModifier } from '../../../../modifier/modifiers/rooted.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { AbilityBlueprint } from '../../../card-blueprint';
import { RARITIES, CARD_SETS, CARD_KINDS } from '../../../card.enums';
import { MeleeFollowup } from '../../../followups/melee-followup';
import { SelfFollowup } from '../../../followups/self-followup';
import { mage } from '../heroes/mage';

export const coneOfFlames: AbilityBlueprint = {
  id: 'cone-of-flames',
  name: 'Cone of Flames',
  getDescription(game, card) {
    return `Deal (${2 + card.unit.abilityPower}) damage to enemies in an area.`;
  },
  cardIconId: 'placeholder',
  rarity: RARITIES.RARE,
  setId: CARD_SETS.CORE,
  kind: CARD_KINDS.ABILITY,
  manaCost: 3,
  levelCost: 1,
  exp: 1,
  classIds: [mage.id],
  followup: new MeleeFollowup({ allowDiagonals: false }),
  getAoe(game, card) {
    return new ConeAOEShape(game, card.unit.player, {
      targetingType: TARGETING_TYPE.ENEMY,
      range: 2,
      origin: card.unit.position
    });
  },
  onPlay(game, card, cells, targets) {
    targets.forEach(target => {
      target.takeDamage(
        card.unit,
        new AbilityDamage({
          baseAmount: 2 + card.unit.abilityPower,
          source: card
        })
      );
    });
  }
};
