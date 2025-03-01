import type { BetterOmit, Point, TuplifyUnion, Values } from '@game/shared';
import { KEYWORDS } from '../../card/card-keyword';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import type { SerializedUnit, Unit } from '../../unit/entities/unit.entity';
import { UNIT_EVENTS } from '../../unit/unit-enums';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { UnitSelfEventModifierMixin } from '../mixins/self-event.mixin';
import { Modifier, MODIFIER_EVENTS, type ModifierEventMap } from '../modifier.entity';

export class BackstabEvent extends TypedSerializableEvent<
  { unit: Unit; target: Unit },
  { unit: SerializedUnit; target: SerializedUnit }
> {
  serialize() {
    return {
      unit: this.data.unit.serialize(),
      target: this.data.target.serialize()
    };
  }
}

export const BACKSTAB_EVENTS = {
  BACKSTAB: 'backstab'
} as const;

export type BackstabEventMap = ModifierEventMap & {
  [BACKSTAB_EVENTS.BACKSTAB]: BackstabEvent;
};

export class BackstabModifier extends Modifier<Unit, BackstabEventMap> {
  constructor(
    game: Game,
    card: AnyCard,
    private amount: number
  ) {
    super(KEYWORDS.BACKSTAB.id, game, card, {
      stackable: false,
      customEventNames: {
        [BACKSTAB_EVENTS.BACKSTAB]: true
      },
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.BACKSTAB),
        new UnitInterceptorModifierMixin(game, {
          key: 'damageDealt',
          interceptor: (value, { target }) => {
            return this.isBackstab(target) ? value + amount : value;
          }
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'canBeCounterattackTarget',
          interceptor: (value, { attacker }) => !this.isBackstab(attacker)
        }),
        new UnitSelfEventModifierMixin(game, {
          eventName: UNIT_EVENTS.AFTER_ATTACK,
          handler: event => {
            if (!this.isBackstab(event.data.target)) return;

            this.emitter.emit(
              BACKSTAB_EVENTS.BACKSTAB,
              new BackstabEvent({
                unit: this.target,
                target: game.unitSystem.getUnitAt(event.data.target)!
              })
            );
          }
        })
      ]
    });
  }

  get backstabAmount() {
    return this.amount;
  }

  isBackstab(point: Point) {
    const target = this.game.unitSystem.getUnitAt(point);
    if (!target) return;

    return this.target.isBehind(target);
  }
}
