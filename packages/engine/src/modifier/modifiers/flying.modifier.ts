import { KEYWORDS } from '../../card/card-keyword';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/entities/unit.entity';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';

export class FlyingModifier extends Modifier<Unit> {
  constructor(game: Game, source: AnyCard) {
    super(KEYWORDS.FLYING.id, game, source, {
      stackable: false,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.FLYING),
        new UnitInterceptorModifierMixin(game, {
          key: 'speed',
          interceptor: () => Infinity
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'canMoveThrough',
          interceptor: () => true
        })
      ]
    });
  }
}
