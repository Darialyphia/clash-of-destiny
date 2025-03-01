import { KEYWORDS } from '../../card/card-keyword';
import type { AnyCard } from '../../card/entities/card.entity';
import { SpellCard } from '../../card/entities/spell-card.entity';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/entities/unit.entity';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';

export class VeilModifier extends Modifier<Unit> {
  constructor(game: Game, source: AnyCard) {
    super(KEYWORDS.VEIL.id, game, source, {
      stackable: false,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.VEIL),
        new UnitInterceptorModifierMixin(game, {
          key: 'canBeCardTarget',
          interceptor: (val, { card }) => {
            if (!val) return val;
            if (card instanceof SpellCard) return false;
            return true;
          }
        })
      ]
    });
  }
}
