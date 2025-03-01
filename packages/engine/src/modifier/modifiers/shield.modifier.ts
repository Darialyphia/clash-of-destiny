import { KEYWORDS } from '../../card/card-keyword';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import type { SerializedUnit, Unit } from '../../unit/entities/unit.entity';
import { UNIT_EVENTS } from '../../unit/unit-enums';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { UnitSelfEventModifierMixin } from '../mixins/self-event.mixin';
import { Modifier, type ModifierEventMap } from '../modifier.entity';

export class LostShieldEvent extends TypedSerializableEvent<
  { unit: Unit },
  { unit: SerializedUnit }
> {
  serialize() {
    return {
      unit: this.data.unit.serialize()
    };
  }
}

const SHIELD_EVENTS = {
  LOST_SHIELD: 'lost_shield'
} as const;

type ShieldEventMap = ModifierEventMap & {
  [SHIELD_EVENTS.LOST_SHIELD]: LostShieldEvent;
};

export class ShieldModifier extends Modifier<Unit, ShieldEventMap> {
  constructor(game: Game, source: AnyCard) {
    super(KEYWORDS.SHIELD.id, game, source, {
      stackable: false,
      customEventNames: {
        [SHIELD_EVENTS.LOST_SHIELD]: true
      },
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.SHIELD),
        new UnitSelfEventModifierMixin(game, {
          eventName: UNIT_EVENTS.BEFORE_RECEIVE_DAMAGE,
          handler: () => {
            const remove = this.target.addInterceptor('damageReceived', () => 0);
            this.target.once(UNIT_EVENTS.AFTER_RECEIVE_DAMAGE, () => {
              remove();
              this.emitter.emit(
                SHIELD_EVENTS.LOST_SHIELD,
                new LostShieldEvent({ unit: this.target })
              );
              this.target.removeModifier(this.id);
            });
          }
        }),
        new UnitSelfEventModifierMixin(game, {
          eventName: UNIT_EVENTS.BEFORE_DESTROY,
          handler: () => {
            const remove = this.target.addInterceptor('canBeDestroyed', () => false);
            this.game.inputSystem.schedule(() => {
              remove();
              this.emitter.emit(
                SHIELD_EVENTS.LOST_SHIELD,
                new LostShieldEvent({ unit: this.target })
              );
              this.target.removeModifier(this.id);
            });
          }
        })
      ]
    });
  }
}
