import type { Modifier } from '../modifier.entity';
import { ModifierMixin } from '../modifier-mixin';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/entities/unit.entity';
import { UNIT_EVENTS } from '../../unit/unit-enums';

export type AuraOptions = {
  isElligible(unit: Unit): boolean;
  onGainAura(unit: Unit): void;
  onLoseAura(unit: Unit): void;
  canSelfApply: boolean;
};

export class AuraModifierMixin extends ModifierMixin<Unit> {
  protected modifier!: Modifier<Unit>;

  private affectedUnitsIds = new Set<string>();

  // we need to track this variable because of how the event emitter works
  // basically if we have an event that says "after unit moves, remove this aura modifier"
  // It will not clean up aura's "after unit move" event before all the current listeners have been ran
  // which would lead to removing the aura, THEN check and apply the aura anyways
  private isApplied = true;

  constructor(
    game: Game,
    private options: AuraOptions
  ) {
    super(game);
    this.checkAura = this.checkAura.bind(this);
    this.cleanup = this.cleanup.bind(this);
  }

  private checkAura() {
    if (!this.isApplied) return;

    this.game.unitSystem.unitsOnBoard.forEach(unit => {
      if (!this.options.canSelfApply && unit.equals(this.modifier.target)) return;
      const shouldGetAura = this.options.isElligible(unit);

      const hasAura = this.affectedUnitsIds.has(unit.id);

      if (!shouldGetAura && hasAura) {
        this.affectedUnitsIds.delete(unit.id);
        this.options.onLoseAura(unit);
        return;
      }

      if (shouldGetAura && !hasAura) {
        this.affectedUnitsIds.add(unit.id);
        this.options.onGainAura(unit);
        return;
      }
    });
  }

  private cleanup() {
    this.game.off('*', this.checkAura);

    this.affectedUnitsIds.forEach(id => {
      const unit = this.game.unitSystem.getUnitById(id);
      if (!unit) return;

      this.affectedUnitsIds.delete(id);
      this.options.onLoseAura(unit);
    });
  }

  onApplied(unit: Unit, modifier: Modifier<Unit>): void {
    this.modifier = modifier;
    this.isApplied = true;

    this.game.on('*', this.checkAura);
    unit.once(UNIT_EVENTS.BEFORE_DESTROY, this.cleanup);
  }

  onRemoved() {
    this.isApplied = false;
    this.cleanup();
  }

  onReapplied() {}
}
