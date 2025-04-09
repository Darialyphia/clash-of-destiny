import { KEYWORDS } from '../../card/card-keyword';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/entities/unit.entity';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';

export class DefiantModifier extends Modifier<Unit> {
  constructor(game: Game, source: AnyCard, minLevel: number) {
    super(KEYWORDS.DEFIANT.id, game, source, {
      stackable: false,
      name: KEYWORDS.DEFIANT.name,
      description: KEYWORDS.DEFIANT.description,
      icon: 'keyword-defiant',
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.DEFIANT),
        new UnitInterceptorModifierMixin(game, {
          key: 'canMove',
          interceptor(value, ctx, modifier) {
            if (!value) return value;
            if (modifier.target.player.hero.level >= minLevel) return value;
            return false;
          }
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'canAttack',
          interceptor(value, ctx, modifier) {
            if (!value) return value;
            if (modifier.target.player.hero.level >= minLevel) return value;
            return false;
          }
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'canUseAbility',
          interceptor(value, ctx, modifier) {
            if (!value) return value;
            if (modifier.target.player.hero.level >= minLevel) return value;
            return false;
          }
        })
      ]
    });
  }
}
