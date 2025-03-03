import type { Game } from '../../game/game';
import type { Unit } from '../../unit/entities/unit.entity';
import { UNIT_EVENTS } from '../../unit/unit-enums';
import { ModifierMixin } from '../modifier-mixin';
import type { Modifier } from '../modifier.entity';

export class WhileOnBoardModifierMixin extends ModifierMixin<Unit> {
  constructor(
    game: Game,
    private options: {
      onApplied: (modifier: Modifier<Unit>) => void;
      onRemoved: (modifier: Modifier<Unit>) => void;
    }
  ) {
    super(game);
  }

  onApplied(target: Unit, modifier: Modifier<Unit>): void {
    this.options.onApplied(modifier);

    [UNIT_EVENTS.AFTER_DESTROY].forEach(event => {
      target.once(event, () => {
        this.options.onRemoved(modifier);
      });
    });
  }

  onRemoved(target: Unit, modifier: Modifier<Unit>): void {
    this.options.onRemoved(modifier);
  }

  onReapplied(): void {}
}
