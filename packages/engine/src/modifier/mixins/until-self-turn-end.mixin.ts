import type { Modifier } from '../modifier.entity';
import { ModifierMixin } from '../modifier-mixin';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/entities/unit.entity';
import { GAME_EVENTS } from '../../game/game.events';
import { UNIT_EVENTS } from '../../unit/unit-enums';

export class UntilSelfTurnEndModifierMixin extends ModifierMixin<Unit> {
  private modifier!: Modifier<Unit>;

  constructor(game: Game) {
    super(game);
    this.onTurnEnd = this.onTurnEnd.bind(this);
  }

  onTurnEnd() {
    this.modifier.target.removeModifier(this.modifier.modifierType);
  }

  onApplied(target: Unit, modifier: Modifier<Unit>): void {
    target.once(UNIT_EVENTS.END_TURN, this.onTurnEnd);
  }

  onRemoved() {
    this.game.off(GAME_EVENTS.TURN_END, this.onTurnEnd);
  }

  onReapplied(): void {}
}
