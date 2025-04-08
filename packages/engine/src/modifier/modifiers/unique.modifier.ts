import { KEYWORDS } from '../../card/card-keyword';
import type { AnyCard } from '../../card/entities/card.entity';
import type { AnyUnitCard } from '../../card/entities/unit-card.entity';
import type { Game } from '../../game/game';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';

export class UniqueModifier extends Modifier<AnyCard> {
  constructor(game: Game, card: AnyUnitCard) {
    super(KEYWORDS.RANGED.id, game, card, {
      stackable: false,
      mixins: [new KeywordModifierMixin(game, KEYWORDS.UNIQUE)]
    });
  }
}
