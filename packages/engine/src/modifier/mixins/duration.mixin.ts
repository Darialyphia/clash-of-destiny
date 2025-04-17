import type { Modifier } from '../modifier.entity';
import { ModifierMixin } from '../modifier-mixin';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/entities/unit.entity';
import { GAME_EVENTS } from '../../game/game.events';

export class DurationModifierMixin<
  T extends Unit | AnyCard = Unit | AnyCard
> extends ModifierMixin<T> {
  private modifier!: Modifier<T>;

  private initialDuration: number;
  constructor(
    game: Game,
    private duration = 1
  ) {
    super(game);
    this.initialDuration = duration;
    this.onTurnEnd = this.onTurnEnd.bind(this);
  }

  onTurnEnd() {
    this.duration--;
    if (this.duration === 0) {
      this.modifier.target.removeModifier(this.modifier.modifierType);
    }
  }

  onApplied(target: T, modifier: Modifier<T>): void {
    this.modifier = modifier;
    this.game.on(GAME_EVENTS.PLAYER_END_TURN, this.onTurnEnd);
  }

  onRemoved() {
    this.game.off(GAME_EVENTS.TURN_END, this.onTurnEnd);
  }

  onReapplied(): void {
    this.duration = this.initialDuration;
  }
}
