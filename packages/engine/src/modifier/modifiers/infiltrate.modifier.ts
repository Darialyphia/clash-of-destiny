import { KEYWORDS } from '../../card/card-keyword';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import type { SerializedUnit, Unit } from '../../unit/entities/unit.entity';
import { TypedSerializableEvent } from '../../utils/typed-emitter';
import { AuraModifierMixin } from '../mixins/aura.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier, type ModifierEventMap } from '../modifier.entity';

export class InfiltratedChangeEvent extends TypedSerializableEvent<
  { unit: Unit; isInfiltrated: boolean },
  { unit: SerializedUnit; isInfiltrated: boolean }
> {
  serialize() {
    return {
      unit: this.data.unit.serialize(),
      isInfiltrated: this.data.isInfiltrated
    };
  }
}

const INFILTRATE_EVENTS = {
  INFILTRATE_CHANGE: 'grow'
} as const;

type InfiltrateEventMap = ModifierEventMap & {
  [INFILTRATE_EVENTS.INFILTRATE_CHANGE]: InfiltratedChangeEvent;
};

export class Infiltrate extends Modifier<Unit, InfiltrateEventMap> {
  constructor(
    game: Game,
    card: AnyCard,
    private options: { onApplied: () => void; onRemoved: () => void }
  ) {
    super(KEYWORDS.INFILTRATE.id, game, card, {
      stackable: false,
      customEventNames: {
        [INFILTRATE_EVENTS.INFILTRATE_CHANGE]: true
      },
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.INFILTRATE),
        new AuraModifierMixin(game, {
          canSelfApply: true,
          isElligible: target => {
            if (target.equals(this.target)) return false;
            const cell = game.boardSystem.getCellAt(target.position);
            if (!cell) return false;
            if (!cell.player) return false;
            return cell.player.equals(this.source.player);
          },
          onGainAura: target => {
            this.options.onApplied();
            this.emitter.emit(
              INFILTRATE_EVENTS.INFILTRATE_CHANGE,
              new InfiltratedChangeEvent({
                unit: target,
                isInfiltrated: true
              })
            );
          },
          onLoseAura: target => {
            this.options.onRemoved();
            this.emitter.emit(
              INFILTRATE_EVENTS.INFILTRATE_CHANGE,
              new InfiltratedChangeEvent({
                unit: target,
                isInfiltrated: false
              })
            );
          }
        })
      ]
    });
  }
}
