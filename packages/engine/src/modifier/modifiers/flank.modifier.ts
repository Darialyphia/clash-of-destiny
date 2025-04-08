import { KEYWORDS } from '../../card/card-keyword';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { UnitCardInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { Modifier } from '../modifier.entity';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import type { MinionCard } from '../../card/entities/minion-card.entity';

export class FlankModifier extends Modifier<MinionCard> {
  constructor(game: Game, source: AnyCard) {
    super(KEYWORDS.FLANK.id, game, source, {
      stackable: false,
      mixins: [
        new UnitCardInterceptorModifierMixin(game, {
          key: 'canPlayAt',
          interceptor: (value, { point }, modifier) => {
            return (
              !this.game.unitSystem.getUnitAt(point) &&
              !!this.game.boardSystem.getCellAt(point)?.isWalkable &&
              modifier.target.player.units.some(unit => unit.position.isNearby(point))
            );
          }
        }),
        new KeywordModifierMixin(game, KEYWORDS.FLANK)
      ]
    });
  }
}
