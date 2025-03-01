import { KEYWORDS } from '../../card/card-keyword';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { AnywhereTargetingStrategy } from '../../targeting/anywhere-targeting-strategy';
import type { Unit } from '../../unit/entities/unit.entity';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';

export class RangedModifier extends Modifier<Unit> {
  constructor(game: Game, card: AnyCard) {
    super(KEYWORDS.RANGED.id, game, card, {
      stackable: false,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.RANGED),
        new UnitInterceptorModifierMixin(game, {
          key: 'attackTargetingPattern',
          interceptor: () =>
            new AnywhereTargetingStrategy(
              game,
              this.target.player,
              this.target.attackTargetType
            )
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'counterattackTargetingPattern',
          interceptor: () =>
            new AnywhereTargetingStrategy(
              game,
              this.target.player,
              this.target.counterattackTargetType
            )
        })
      ]
    });
  }
}
