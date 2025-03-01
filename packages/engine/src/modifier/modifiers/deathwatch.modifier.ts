import { KEYWORDS } from '../../card/card-keyword';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import type { Unit } from '../../unit/entities/unit.entity';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';

export class DeathwatchModifier extends Modifier<Unit> {
  constructor(game: Game, source: AnyCard, handler: () => void) {
    super(KEYWORDS.DEATHWATCH.id, game, source, {
      stackable: false,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.DEATHWATCH),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.UNIT_AFTER_DESTROY,
          handler
        })
      ]
    });
  }
}
