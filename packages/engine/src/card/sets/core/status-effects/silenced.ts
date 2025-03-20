import { SilencedModifier } from '../../../../modifier/modifiers/silenced.modifier';
import type { StatusEffectBlueprint } from '../../../card-blueprint';
import { RARITIES, CARD_SETS, CARD_KINDS } from '../../../card.enums';

export const silenced: StatusEffectBlueprint = {
  id: 'silenced',
  name: 'Silenced',
  getDescription() {
    return `Cannot use Ability Cards. Discard one Silenced card at the end of the turn.`;
  },
  cardIconId: 'placeholder',
  rarity: RARITIES.TOKEN,
  setId: CARD_SETS.CORE,
  kind: CARD_KINDS.STATUS,
  onPlay(game, card) {
    const modifier = card.unit.getModifier(SilencedModifier);
    if (modifier) {
      modifier.removeStacks(1);
    }
  }
};
