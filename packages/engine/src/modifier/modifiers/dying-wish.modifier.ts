import { KEYWORDS } from '../../card/card-keyword';
import type { AnyCard } from '../../card/entities/card.entity';
import type { UnitCard } from '../../card/entities/unit-card.entity';
import type { Game } from '../../game/game';
import type { UnitAfterDestroyEvent } from '../../unit/unit.events';
import { DyingWishModifierMixin } from '../mixins/dying-wish.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';

export class DyingWishModifier extends Modifier<UnitCard> {
  constructor(
    game: Game,
    source: AnyCard,
    handler: (event: UnitAfterDestroyEvent) => void
  ) {
    super(KEYWORDS.DYING_WISH.id, game, source, {
      stackable: false,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.DYING_WISH),
        new DyingWishModifierMixin(game, handler)
      ]
    });
  }
}
