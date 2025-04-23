import { KEYWORDS } from '../../card/card-keyword';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS, GameUnitEvent, type GameEvent } from '../../game/game.events';
import type { Unit } from '../../unit/entities/unit.entity';
import type {
  UnitAfterDestroyEvent,
  UnitBeforeDestroyEvent
} from '../../unit/unit.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class OnKillModifier<TTrigger extends 'before' | 'after'> extends Modifier<Unit> {
  constructor(
    game: Game,
    source: AnyCard,
    options: {
      mixins?: ModifierMixin<Unit>[];
      handler: (
        event: TTrigger extends 'before'
          ? GameUnitEvent<UnitBeforeDestroyEvent>
          : GameUnitEvent<UnitAfterDestroyEvent>,
        modifier: Modifier<Unit>
      ) => void;
      once?: boolean;
      trigger?: TTrigger;
    }
  ) {
    super(KEYWORDS.ON_ENTER.id, game, source, {
      stackable: false,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.ON_ATTACK),
        new GameEventModifierMixin(game, {
          eventName:
            (options.trigger ?? 'after') === 'after'
              ? GAME_EVENTS.UNIT_AFTER_DESTROY
              : GAME_EVENTS.UNIT_BEFORE_DESTROY,
          handler: event => {
            if (event.data.event.data.source.equals(this.target.card)) {
              options.handler(event as any, this);
            }
          }
        }),
        ...(options.mixins || [])
      ]
    });
  }
}
