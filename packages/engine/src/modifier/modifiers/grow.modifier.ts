import { KEYWORDS } from '../../card/card-keyword';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import type { SerializedUnit, Unit } from '../../unit/entities/unit.entity';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier, type ModifierEventMap } from '../modifier.entity';

export class GrowEvent extends TypedSerializableEvent<
  { unit: Unit },
  { unit: SerializedUnit }
> {
  serialize() {
    return {
      unit: this.data.unit.serialize()
    };
  }
}

const GROW_EVENTS = {
  GROW: 'grow'
} as const;

type GrowEventMap = {
  [GROW_EVENTS.GROW]: GrowEvent;
};

export class GrowModifier extends Modifier<Unit, ModifierEventMap & GrowEventMap> {
  constructor(
    game: Game,
    source: AnyCard,
    private options: { atkGrowValue: number; hpGrowValue: number }
  ) {
    super(KEYWORDS.GROW.id, game, source, {
      stackable: true,
      initialStacks: 1,
      customEventNames: {
        [GROW_EVENTS.GROW]: true
      },
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.GROW),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.PLAYER_START_TURN,
          handler: event => {
            if (event.data.player.equals(this.source.player)) {
              this.triggerGrow();
            }
          }
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'attack',
          interceptor: atk => atk + this.options.atkGrowValue * this.stacks
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'maxHp',
          interceptor: hp => hp + this.options.hpGrowValue * this.stacks
        })
      ]
    });
  }

  triggerGrow() {
    this.addStacks(1);
    this.emitter.emit(GROW_EVENTS.GROW, new GrowEvent({ unit: this.target }));
  }
}
