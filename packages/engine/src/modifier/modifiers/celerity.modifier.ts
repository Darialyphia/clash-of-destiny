import { KEYWORDS } from '../../card/card-keyword';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/entities/unit.entity';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';

export class CelerityModifier extends Modifier<Unit> {
  constructor(game: Game, source: AnyCard) {
    super(KEYWORDS.CELERITY.id, game, source, {
      stackable: false,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.CELERITY),
        new UnitInterceptorModifierMixin(game, {
          key: 'maxAttacksPerTurn',
          interceptor: value => value + 1
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'maxMovementsPerTurn',
          interceptor: value => value + 1
        })
      ]
    });
  }
}
