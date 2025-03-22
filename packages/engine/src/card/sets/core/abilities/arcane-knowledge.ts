import { NoAOEShape } from '../../../../aoe/no-aoe.aoe-shape';
import type { AbilityBlueprint } from '../../../card-blueprint';
import { RARITIES, CARD_SETS, CARD_KINDS } from '../../../card.enums';
import { SelfFollowup } from '../../../followups/self-followup';
import { mage } from '../heroes/mage';

export const arcaneKnowledge: AbilityBlueprint = {
  id: 'arcane-knowledge',
  name: 'Arcane Knowledge',
  getDescription() {
    return `Draw 2 cards.`;
  },
  cardIconId: 'card-arcane-knowledge',
  rarity: RARITIES.COMMON,
  setId: CARD_SETS.CORE,
  kind: CARD_KINDS.ABILITY,
  manaCost: 1,
  levelCost: 1,
  exp: 1,
  classIds: [mage.id],
  getFollowup() {
    return new SelfFollowup();
  },
  getAoe() {
    return new NoAOEShape();
  },
  onPlay(game, card) {
    card.unit.draw(2);
  }
};
