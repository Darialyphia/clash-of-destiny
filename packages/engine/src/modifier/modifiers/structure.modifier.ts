import { KEYWORDS } from '../../card/card-keyword';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/entities/unit.entity';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';

export class StructureModifier extends Modifier<Unit> {
  constructor(game: Game, card: AnyCard) {
    super(KEYWORDS.STRUCTURE.id, game, card, {
      stackable: false,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.STRUCTURE),
        new UnitInterceptorModifierMixin(game, {
          key: 'canMove',
          interceptor: () => false
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'canAttack',
          interceptor: () => false
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'canCounterAttack',
          interceptor: () => false
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'attack',
          interceptor: () => 0,
          prioriry: 999
        })
      ]
    });
  }
}
