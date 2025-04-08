import { KEYWORDS } from '../../card/card-keyword';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/entities/unit.entity';
import { UNIT_EVENTS } from '../../unit/unit-enums';
import type { UnitAttackEvent } from '../../unit/unit.events';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { UnitSelfEventModifierMixin } from '../mixins/self-event.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class OnAttackModifier extends Modifier<Unit> {
  constructor(
    game: Game,
    source: AnyCard,
    options: {
      mixins?: ModifierMixin<Unit>[];
      handler: (event: UnitAttackEvent, modifier: Modifier<Unit>) => void;
      once?: boolean;
    }
  ) {
    super(KEYWORDS.ON_ENTER.id, game, source, {
      stackable: false,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.ON_ATTACK),
        new UnitSelfEventModifierMixin(game, {
          eventName: UNIT_EVENTS.AFTER_ATTACK,
          handler: event => {
            options.handler(event, this);
          },
          once: options.once
        }),
        ...(options.mixins || [])
      ]
    });
  }
}
