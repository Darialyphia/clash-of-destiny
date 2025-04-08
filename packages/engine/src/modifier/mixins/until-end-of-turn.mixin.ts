import { Game } from '../../game/game';
import { PLAYER_EVENTS } from '../../player/player-enums';
import type { Unit } from '../../unit/entities/unit.entity';
import { ModifierMixin } from '../modifier-mixin';
import type { Modifier } from '../modifier.entity';

export class UntilEndOfTurnModifierMixin extends ModifierMixin<Unit> {
  private modifier!: Modifier<Unit>;

  constructor(game: Game) {
    super(game);
    this.onTurnEnd = this.onTurnEnd.bind(this);
  }

  onTurnEnd() {
    this.modifier.target.removeModifier(this.modifier.id);
  }

  onApplied(unit: Unit, modifier: Modifier<Unit>): void {
    this.modifier = modifier;
    this.game.gamePhaseSystem.turnPlayer.once(PLAYER_EVENTS.END_TURN, this.onTurnEnd);
  }

  onRemoved(unit: Unit): void {
    unit.player.off(PLAYER_EVENTS.END_TURN, this.onTurnEnd);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onReapplied(): void {}
}
