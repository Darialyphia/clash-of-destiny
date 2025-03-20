import { RootedModifier } from '../../../../modifier/modifiers/rooted.modifier';
import type { StatusEffectBlueprint } from '../../../card-blueprint';
import { RARITIES, CARD_SETS, CARD_KINDS } from '../../../card.enums';

export const rooted: StatusEffectBlueprint = {
  id: 'rooted',
  name: 'Rooted',
  getDescription() {
    return `Cannot move. Discard one Rooted card at the end of the turn.`;
  },
  cardIconId: 'placeholder',
  rarity: RARITIES.TOKEN,
  setId: CARD_SETS.CORE,
  kind: CARD_KINDS.STATUS,
  onPlay(game, card) {
    const modifier = card.unit.getModifier(RootedModifier);
    if (modifier) {
      modifier.removeStacks(1);
    }
  }
};
