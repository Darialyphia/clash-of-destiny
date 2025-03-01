import { KEYWORDS } from '../../card/card-keyword';
import type { AnyCard } from '../../card/entities/card.entity';
import type { UnitCard } from '../../card/entities/unit-card.entity';
import type { Game } from '../../game/game';
import type { UnitCreatedEvent } from '../../unit/unit.events';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { OpeningGambitModifierMixin } from '../mixins/opening-gambit.mixin';
import { Modifier } from '../modifier.entity';

export class OpeningGambitModifier extends Modifier<UnitCard> {
  constructor(game: Game, source: AnyCard, handler: (event: UnitCreatedEvent) => void) {
    super(KEYWORDS.OPENING_GAMBIT.id, game, source, {
      stackable: false,
      mixins: [
        new OpeningGambitModifierMixin(game, handler),
        new KeywordModifierMixin(game, KEYWORDS.OPENING_GAMBIT)
      ]
    });
  }
}
