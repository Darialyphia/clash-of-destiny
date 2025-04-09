import { KEYWORDS } from '../../card/card-keyword';
import type { AnyUnitCard } from '../../card/entities/unit-card.entity';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/entities/unit.entity';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class VigilantModifier extends Modifier<Unit> {
  constructor(
    game: Game,
    card: AnyUnitCard,
    options?: { mixins?: ModifierMixin<Unit>[] }
  ) {
    super(KEYWORDS.VIGILANT.id, game, card, {
      stackable: false,
      name: KEYWORDS.VIGILANT.name,
      description: KEYWORDS.VIGILANT.description,
      icon: 'keyword-vigilant',
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.VIGILANT),
        new UnitInterceptorModifierMixin(game, {
          key: 'maxCounterattacksPerTurn',
          interceptor: () => Infinity
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}
