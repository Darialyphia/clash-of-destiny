import { isDefined } from '@game/shared';
import { KEYWORDS } from '../../card/card-keyword';
import type { AnyCard } from '../../card/entities/card.entity';
import type { UnitCard } from '../../card/entities/unit-card.entity';
import type { Game } from '../../game/game';
import { UnitCardInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { Modifier } from '../modifier.entity';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';

export class AirdropModifier extends Modifier<UnitCard> {
  constructor(game: Game, source: AnyCard) {
    super(KEYWORDS.OPENING_GAMBIT.id, game, source, {
      stackable: false,
      mixins: [
        new UnitCardInterceptorModifierMixin(game, {
          key: 'canPlayAt',
          interceptor: (value, { point }) => {
            return !isDefined(game.unitSystem.getUnitAt(point));
          }
        }),
        new KeywordModifierMixin(game, KEYWORDS.AIRDROP)
      ]
    });
  }
}
