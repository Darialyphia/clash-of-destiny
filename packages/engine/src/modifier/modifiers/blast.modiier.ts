import { BlastAOEShape } from '../../aoe/blast.aoe-shape';
import type { Cell, SerializedCell } from '../../board/cell';
import { KEYWORDS } from '../../card/card-keyword';
import type { AnyCard } from '../../card/entities/card.entity';
import { EveryCounterAttackParticipantStrategy } from '../../combat/counterattack-participants';
import type { Game } from '../../game/game';
import { BlasTargetingStrategy } from '../../targeting/blast-targeting.strategy';
import type { SerializedUnit, Unit } from '../../unit/entities/unit.entity';
import { UNIT_EVENTS } from '../../unit/unit-enums';
import type { UnitAttackEvent } from '../../unit/unit.events';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { UnitSelfEventModifierMixin } from '../mixins/self-event.mixin';
import { Modifier, type ModifierEventMap } from '../modifier.entity';

export class BlastEvent extends TypedSerializableEvent<
  { unit: Unit; cells: Cell[] },
  { unit: SerializedUnit; cells: SerializedCell[] }
> {
  serialize() {
    return {
      unit: this.data.unit.serialize(),
      cells: this.data.cells.map(cell => cell.serialize())
    };
  }
}

const BLAST_EVENTS = {
  BLAST: 'blast'
} as const;

type BlastEventMap = ModifierEventMap & {
  [BLAST_EVENTS.BLAST]: BlastEvent;
};

export class BlastModifier extends Modifier<Unit, BlastEventMap> {
  constructor(game: Game, source: AnyCard) {
    super(KEYWORDS.BLAST.id, game, source, {
      stackable: false,
      customEventNames: {
        [BLAST_EVENTS.BLAST]: true
      },
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.BLAST),
        new UnitInterceptorModifierMixin(game, {
          key: 'attackTargetingPattern',
          interceptor: () =>
            new BlasTargetingStrategy(game, this.target, this.target.attackTargetType)
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'attackAOEShape',
          interceptor: () =>
            new BlastAOEShape(game, this.target, this.target.attackTargetType)
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'attackCounterattackParticipants',
          interceptor: () => new EveryCounterAttackParticipantStrategy()
        }),
        new UnitSelfEventModifierMixin(game, {
          eventName: UNIT_EVENTS.BEFORE_ATTACK,
          handler: event => {
            this.onBeforeAttack(event);
          }
        })
      ]
    });
  }

  private onBeforeAttack(event: UnitAttackEvent) {
    const targetingPattern = this.target.attackTargettingPattern as BlasTargetingStrategy;
    if (!targetingPattern.isBlastTarget(event.target)) return;

    const cells = this.target.attackAOEShape.getCells([event.target]);
    this.target.once(UNIT_EVENTS.AFTER_ATTACK, () => {
      this.emitter.emit(BLAST_EVENTS.BLAST, new BlastEvent({ unit: this.target, cells }));
    });
  }
}
