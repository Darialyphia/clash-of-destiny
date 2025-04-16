import { KEYWORDS } from '../../card/card-keyword';
import type { AnyCard } from '../../card/entities/card.entity';
import { CombatDamage } from '../../combat/damage';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/entities/unit.entity';
import { UNIT_EVENTS } from '../../unit/unit-enums';
import { UnitSelfEventModifierMixin } from '../mixins/self-event.mixin';
import { Modifier } from '../modifier.entity';

export class ElusiveModifier extends Modifier<Unit> {
  constructor(game: Game, card: AnyCard) {
    super(KEYWORDS.ELUSIVE.id, game, card, {
      stackable: false,
      name: KEYWORDS.ELUSIVE.name,
      description: KEYWORDS.ELUSIVE.description,
      mixins: [
        new UnitSelfEventModifierMixin(game, {
          eventName: UNIT_EVENTS.BEFORE_RECEIVE_DAMAGE,
          handler: (event, target) => {
            if (!event.data.target.equals(target)) return;

            const behind = this.game.boardSystem.getCellBehind(target);
            if (!behind) return;
            if (!behind.isWalkable || behind.unit) return;

            const cleanups = [
              target.addInterceptor('damageReceived', (value, { damage }) => {
                if (damage instanceof CombatDamage) return 0;
                return value;
              }),
              target.once(UNIT_EVENTS.AFTER_RECEIVE_DAMAGE, e => {
                if (e.data.damage instanceof CombatDamage) {
                  cleanups.forEach(c => {
                    c();
                  });
                }
              })
            ];

            target.teleport(behind);
          }
        })
      ]
    });
  }
}
