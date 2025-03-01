import { RingAOEShape } from '../../aoe/ring.aoe-shape';
import { KEYWORDS } from '../../card/card-keyword';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/entities/unit.entity';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';

export class FrenzyModifier extends Modifier<Unit> {
  constructor(game: Game, source: AnyCard) {
    super(KEYWORDS.FRENZY.id, game, source, {
      stackable: false,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.FRENZY),
        new UnitInterceptorModifierMixin(game, {
          key: 'attackAOEShape',
          interceptor: () =>
            new RingAOEShape(game, this.target.player, {
              targetingType: this.target.attackTargetType,
              origin: this.target.position
            })
        })
      ]
    });
  }
}
