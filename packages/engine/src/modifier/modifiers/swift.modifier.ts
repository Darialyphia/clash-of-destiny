import { KEYWORDS } from '../../card/card-keyword';
import type { AnyUnitCard } from '../../card/entities/unit-card.entity';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/entities/unit.entity';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class SwiftdModifier extends Modifier<Unit> {
  constructor(
    game: Game,
    card: AnyUnitCard,
    options?: { mixins?: ModifierMixin<Unit>[] }
  ) {
    super(KEYWORDS.SWIFT.id, game, card, {
      stackable: false,
      name: KEYWORDS.SWIFT.name,
      description: KEYWORDS.SWIFT.description,
      icon: 'keyword-swift',
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.RANGED),
        new UnitInterceptorModifierMixin(game, {
          key: 'maxMovementsPerTurn',
          interceptor: () => 2
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}
