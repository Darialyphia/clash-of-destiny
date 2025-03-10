import { NoAOEShape } from '../../../../aoe/no-aoe.aoe-shape';
import type { AbilityBlueprint } from '../../../card-blueprint';
import { RARITIES, CARD_SETS, CARD_KINDS } from '../../../card.enums';
import { NoFollowup } from '../../../followups/no-followup';
import { mage } from '../heroes/mage';

export const arcaneKnowledge: AbilityBlueprint = {
  id: 'arcane-knowledge',
  name: 'Arcane Knowledge',
  description: 'Draw 2 cards.',
  rarity: RARITIES.COMMON,
  setId: CARD_SETS.CORE,
  kind: CARD_KINDS.ABILITY,
  manaCost: 1,
  levelCost: 1,
  exp: 1,
  classIds: [mage.id],
  followup: new NoFollowup(),
  getAoe() {
    return new NoAOEShape();
  },
  onPlay(game, card) {
    card.unit.cards.draw(2);
  }
};
