import { ProjectileAOEShape } from '../../../../aoe/projectile.aoe-shape';
import { AbilityDamage } from '../../../../combat/damage';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { AbilityBlueprint } from '../../../card-blueprint';
import { RARITIES, CARD_SETS, CARD_KINDS } from '../../../card.enums';
import { ProjectileFollowup } from '../../../followups/projectile-followup';
import { mage } from '../heroes/mage';

export const magicMissile: AbilityBlueprint = {
  id: 'magic-missile',
  name: 'Magic Missile',
  description:
    'Fires a projectile in a line that deals 1 damage to the first target hit.',
  cardIconId: 'placeholder',
  rarity: RARITIES.COMMON,
  setId: CARD_SETS.CORE,
  kind: CARD_KINDS.ABILITY,
  manaCost: 1,
  levelCost: 1,
  exp: 1,
  classIds: [mage.id],
  followup: new ProjectileFollowup(),
  getAoe(game, card) {
    return new ProjectileAOEShape(
      game,
      card.unit.player,
      card.unit.position,
      TARGETING_TYPE.NON_EMPTY
    );
  },
  onPlay(game, card, cells, targets) {
    const target = targets[0];
    if (target) {
      target.takeDamage(
        card.unit,
        new AbilityDamage({
          baseAmount: 5,
          source: card
        })
      );
    }
  }
};
