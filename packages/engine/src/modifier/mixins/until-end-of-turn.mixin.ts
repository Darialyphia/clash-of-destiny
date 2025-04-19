import type { AnyCard } from '../../card/entities/card.entity';
import { Game } from '../../game/game';
import { PLAYER_EVENTS } from '../../player/player-enums';
import type { Player } from '../../player/player.entity';
import type { Unit } from '../../unit/entities/unit.entity';
import { ModifierMixin } from '../modifier-mixin';
import type { Modifier } from '../modifier.entity';

export class UntilEndOfTurnModifierMixin extends ModifierMixin<Unit | AnyCard> {
  private modifier!: Modifier<Unit | AnyCard>;
  private activePlayerWhenApplied!: Player;

  constructor(game: Game) {
    super(game);
    this.onTurnEnd = this.onTurnEnd.bind(this);
  }

  onTurnEnd() {
    this.modifier.target.removeModifier(this.modifier.id);
  }

  onApplied(target: Unit | AnyCard, modifier: Modifier<Unit | AnyCard>): void {
    this.modifier = modifier;
    this.activePlayerWhenApplied = this.game.gamePhaseSystem.turnPlayer;
    this.game.gamePhaseSystem.turnPlayer.once(PLAYER_EVENTS.END_TURN, this.onTurnEnd);
  }

  onRemoved(): void {
    this.activePlayerWhenApplied.off(PLAYER_EVENTS.END_TURN, this.onTurnEnd);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onReapplied(): void {}
}
