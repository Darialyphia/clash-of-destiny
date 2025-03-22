import { PointAOEShape } from '../../../../aoe/point.aoe-shape';
import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import type { AbilityBlueprint } from '../../../card-blueprint';
import { RARITIES, CARD_SETS, CARD_KINDS } from '../../../card.enums';
import { RangedFollowup } from '../../../followups/ranged-followup';
import { acolyte } from '../heroes/acolyte';

export const blink: AbilityBlueprint = {
  id: 'blink',
  name: 'Blink',
  getDescription() {
    return `Teleport up to 2 spaceds away. Draw a card.`;
  },
  cardIconId: 'placeholder',
  rarity: RARITIES.RARE,
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
      targetingType: TARGETING_TYPE.EMPTY
    });
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.unit.player, TARGETING_TYPE.ALLY);
  },
  onPlay(game, card, cells) {
    const target = cells[0];
    card.unit.teleport(target);
    card.unit.cards.draw(1);
  }
};
