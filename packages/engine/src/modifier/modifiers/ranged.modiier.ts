import { KEYWORDS } from '../../card/card-keyword';
import type { AnyUnitCard } from '../../card/entities/unit-card.entity';
import type { Game } from '../../game/game';
import { RangedTargetingStrategy } from '../../targeting/ranged-targeting.strategy';
import type { Unit } from '../../unit/entities/unit.entity';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';

export class RangedModifier extends Modifier<Unit> {
  constructor(game: Game, card: AnyUnitCard, range: number) {
    super(KEYWORDS.RANGED.id, game, card, {
      stackable: false,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.RANGED),
        new UnitInterceptorModifierMixin(game, {
          key: 'attackTargetingPattern',
          interceptor: () =>
            new RangedTargetingStrategy(
              game,
              card,
              card.unit.position,
              card.unit.attackTargetType,
              {
                minRange: 1,
                maxRange: range
              }
            )
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'counterattackTargetingPattern',
          interceptor: () =>
            new RangedTargetingStrategy(
              game,
              card,
              card.unit.position,
              card.unit.attackTargetType,
              {
                minRange: 2,
                maxRange: range
              }
            )
        })
      ]
    });
  }
}
