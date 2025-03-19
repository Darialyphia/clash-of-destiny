import { NoAOEShape } from '../../../../aoe/no-aoe.aoe-shape';
import { RootedModifier } from '../../../../modifier/modifiers/rooted.modifier';
import type { AbilityBlueprint } from '../../../card-blueprint';
import { RARITIES, CARD_SETS, CARD_KINDS } from '../../../card.enums';
import { SelfFollowup } from '../../../followups/self-followup';

export const rooted: AbilityBlueprint = {
  id: 'rooted',
  name: 'Rooted',
  getDescription() {
    return `Cannot move. Discard one Rooted card at the end of the turn.`;
  },
  cardIconId: 'placeholder',
  rarity: RARITIES.TOKEN,
  setId: CARD_SETS.CORE,
  kind: CARD_KINDS.ABILITY,
  manaCost: 0,
  levelCost: 1,
  exp: 0,
  classIds: [],
  followup: new SelfFollowup(),
  getAoe() {
    return new NoAOEShape();
  },
  onPlay(game, card) {
    const modifier = card.unit.getModifier(RootedModifier);
    if (modifier) {
      modifier.removeStacks(1);
    }
  }
};
