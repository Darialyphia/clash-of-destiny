import { KEYWORDS } from '../../card/card-keyword';
import { CARD_KINDS } from '../../card/card.enums';
import type { AnyCard } from '../../card/entities/card.entity';
import { silenced } from '../../card/sets/core/status-effects/silenced';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/entities/unit.entity';
import { UNIT_EVENTS } from '../../unit/unit-enums';
import { AddCardToHandModifierMixin } from '../mixins/add-cards-to-hand.mixin';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { UnitSelfEventModifierMixin } from '../mixins/self-event.mixin';
import { Modifier } from '../modifier.entity';

export class SilencedModifier extends Modifier<Unit> {
  constructor(game: Game, source: AnyCard, stacks = 1) {
    super(KEYWORDS.ROOTED.id, game, source, {
      name: KEYWORDS.ROOTED.name,
      description: KEYWORDS.ROOTED.description,
      icon: 'keyword-silenced',
      stackable: true,
      initialStacks: stacks,
      mixins: [
        new AddCardToHandModifierMixin(game, silenced.id),
        new UnitInterceptorModifierMixin(game, {
          key: 'canPlayCard',
          interceptor: (value, { card }) => {
            if (!value) return false;
            return card.kind !== CARD_KINDS.ABILITY;
          }
        }),
        new UnitSelfEventModifierMixin(game, {
          eventName: UNIT_EVENTS.END_TURN,
          handler(event, unit, modifier) {
            const card = unit.cards.hand.find(c => c.blueprintId === silenced.id);
            if (card) {
              unit.cards.discard(card);
            }
            modifier.removeStacks(1);
          }
        })
      ]
    });
  }
}
