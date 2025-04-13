import { KEYWORDS } from '../../card/card-keyword';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/entities/unit.entity';
import { DurationModifierMixin } from '../mixins/duration.mixin';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';
import { ModifierMixin } from '../modifier-mixin';

export class ExhaustOnAppliedModifierMixin extends ModifierMixin<Unit> {
  onApplied(target: Unit): void {
    target.exhaust();
  }

  onRemoved() {}

  onReapplied() {}
}

export class FrozenModifier extends Modifier<Unit> {
  constructor(game: Game, card: AnyCard, options?: { mixins?: ModifierMixin<Unit>[] }) {
    super(KEYWORDS.FROZEN.id, game, card, {
      stackable: false,
      name: KEYWORDS.FROZEN.name,
      description: KEYWORDS.FROZEN.description,
      icon: 'keyword-frozen',
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.FROZEN),
        new DurationModifierMixin(game, 2),
        new ExhaustOnAppliedModifierMixin(game),
        new UnitInterceptorModifierMixin(game, {
          key: 'shouldWakeUpAtStartOfTurn',
          interceptor() {
            return false;
          }
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}
