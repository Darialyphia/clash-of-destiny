import type { Modifier } from '../modifier.entity';
import { ModifierMixin } from '../modifier-mixin';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/entities/unit.entity';
import { GAME_EVENTS } from '../../game/game.events';

export class DurationModifierMixin extends ModifierMixin<Unit | AnyCard> {
  private modifier!: Modifier<Unit | AnyCard>;

  constructor(
    game: Game,
    private duration = 1
  ) {
    super(game);
    this.onTurnStart = this.onTurnStart.bind(this);
  }

  onTurnStart() {
    this.duration--;
    if (this.duration === 0) {
      this.modifier.target.removeModifier(this.modifier.id);
    }
  }

  onApplied(target: Unit | AnyCard, modifier: Modifier<Unit | AnyCard>): void {
    this.modifier = modifier;
    this.game.on(GAME_EVENTS.TURN_START, this.onTurnStart);
  }

  onRemoved() {
    this.game.off(GAME_EVENTS.TURN_END, this.onTurnStart);
  }

  onReapplied(): void {}
}
