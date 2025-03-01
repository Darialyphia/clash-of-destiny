import { KEYWORDS } from '../../card/card-keyword';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/entities/unit.entity';
import { DurationModifierMixin } from '../mixins/duration.mixin';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';

export class StunnedModifier extends Modifier<Unit> {
  constructor(game: Game, card: AnyCard) {
    super(KEYWORDS.STUNNED.id, game, card, {
      stackable: false,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.STUNNED),
        new UnitInterceptorModifierMixin(game, {
          key: 'canAttack',
          interceptor: () => false
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'canMove',
          interceptor: () => false
        })
      ]
    });

    this.addMixin(
      new DurationModifierMixin(
        game,
        // if your unit is stunned during your turn, they will remain stunned until the end of your NEXT turn
        game.turnSystem.activePlayer.equals(this.target.player) ? 3 : 2
      )
    );
  }
}
