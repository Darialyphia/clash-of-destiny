import { BoxAOEShape } from '../../../../aoe/box.aoe-shape';
import { SilencedModifier } from '../../../../modifier/modifiers/silenced.modifier';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { AbilityBlueprint } from '../../../card-blueprint';
import { RARITIES, CARD_SETS, CARD_KINDS } from '../../../card.enums';
import { RangedFollowup } from '../../../followups/ranged-followup';
import { acolyte } from '../heroes/acolyte';

export const equinox: AbilityBlueprint = {
  id: 'equinox',
  name: 'Equinox',
  getDescription() {
    return `Inflict Silenced(2) to units in a 2x2 area.`;
  },
  cardIconId: 'placeholder',
  rarity: RARITIES.RARE,
  setId: CARD_SETS.CORE,
  kind: CARD_KINDS.ABILITY,
  manaCost: 3,
  levelCost: 1,
  exp: 1,
  classIds: [acolyte.id],
  getFollowup() {
    return new RangedFollowup({
      minRange: 0,
      maxRange: 3,
      targetsCount: 1,
      targetingType: TARGETING_TYPE.ANYWHERE
    });
  },
  getAoe(game, card) {
    return new BoxAOEShape(game, card.unit.player, {
      targetingType: TARGETING_TYPE.ENEMY,
      width: 2,
      height: 2
    });
  },
  onPlay(game, card, cells, targets) {
    targets.forEach(target => {
      target.addModifier(new SilencedModifier(game, card, 2));
    });
  }
};
