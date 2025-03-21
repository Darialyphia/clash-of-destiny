import { DisarmedModifier } from '../../../../modifier/modifiers/disarmed.modifier';
import type { StatusEffectBlueprint } from '../../../card-blueprint';
import { RARITIES, CARD_SETS, CARD_KINDS } from '../../../card.enums';

export const disarmed: StatusEffectBlueprint = {
  id: 'disarmed',
  name: 'Disarmed',
  getDescription() {
    return `Cannot attack. Discard one Rooted card at the end of the turn.`;
  },
  cardIconId: 'placeholder',
  rarity: RARITIES.TOKEN,
  setId: CARD_SETS.CORE,
  kind: CARD_KINDS.STATUS,
  onPlay(game, card) {
    const modifier = card.unit.getModifier(DisarmedModifier);
    if (modifier) {
      modifier.removeStacks(1);
    }
  }
};
