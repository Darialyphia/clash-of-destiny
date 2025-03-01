import { KEYWORDS } from '../../card/card-keyword';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/entities/unit.entity';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';

export class RushModifier extends Modifier<Unit> {
  constructor(game: Game, source: AnyCard) {
    super(KEYWORDS.RUSH.id, game, source, {
      stackable: false,
      mixins: [
        new UnitInterceptorModifierMixin(game, {
          key: 'shouldDeactivateWhenSummoned',
          interceptor: () => false
        }),
        new KeywordModifierMixin(game, KEYWORDS.RUSH)
      ]
    });
  }
}
