import { KEYWORDS } from '../../card/card-keyword';
import type { AnyCard } from '../../card/entities/card.entity';
import { disarmed } from '../../card/sets/core/status-effects/disarmed';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/entities/unit.entity';
import { UNIT_EVENTS } from '../../unit/unit-enums';
import { AddCardToHandModifierMixin } from '../mixins/add-cards-to-hand.mixin';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { UnitSelfEventModifierMixin } from '../mixins/self-event.mixin';
import { Modifier } from '../modifier.entity';

export class DisarmedModifier extends Modifier<Unit> {
  constructor(game: Game, source: AnyCard, stacks = 1) {
    super(KEYWORDS.DISARMED.id, game, source, {
      name: KEYWORDS.DISARMED.name,
      description: KEYWORDS.DISARMED.description,
      icon: 'keyword-disarmed',
      stackable: true,
      initialStacks: stacks,
      mixins: [
        new AddCardToHandModifierMixin(game, disarmed.id),
        new UnitInterceptorModifierMixin(game, {
          key: 'canAttack',
          interceptor: () => false
        }),
        new UnitSelfEventModifierMixin(game, {
          eventName: UNIT_EVENTS.END_TURN,
          handler(event, unit, modifier) {
            const card = unit.cards.hand.find(c => c.blueprintId === disarmed.id);
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
