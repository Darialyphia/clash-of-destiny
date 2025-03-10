import type { Modifier } from '../modifier.entity';
import { ModifierMixin } from '../modifier-mixin';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/entities/unit.entity';
import type { UnitEventMap } from '../../unit/unit.events';
import type { Artifact, ArtifactEventMap } from '../../unit/entities/artifact.entity';

export class UnitSelfEventModifierMixin<
  TEvent extends keyof UnitEventMap
> extends ModifierMixin<Unit> {
  private modifier!: Modifier<Unit>;

  constructor(
    game: Game,
    private options: {
      eventName: TEvent;
      handler: (event: UnitEventMap[TEvent]) => void;
      once?: boolean;
    }
  ) {
    super(game);
  }

  onApplied(unit: Unit, modifier: Modifier<Unit>): void {
    this.modifier = modifier;
    if (this.options.once) {
      unit.once(this.options.eventName, this.options.handler as any);
    } else {
      unit.on(this.options.eventName, this.options.handler as any);
    }
  }

  onRemoved(unit: Unit): void {
    unit.off(this.options.eventName, this.options.handler as any);
  }

  onReapplied(): void {}
}

export class ArtifactSelfEventModifierMixin<
  TEvent extends keyof ArtifactEventMap
> extends ModifierMixin<Artifact> {
  private modifier!: Modifier<Artifact>;

  constructor(
    game: Game,
    private options: {
      eventName: TEvent;
      handler: (event: ArtifactEventMap[TEvent]) => void;
      once?: boolean;
    }
  ) {
    super(game);
  }

  onApplied(artifact: Artifact, modifier: Modifier<Artifact>): void {
    this.modifier = modifier;
    if (this.options.once) {
      artifact.once(this.options.eventName, this.options.handler as any);
    } else {
      artifact.on(this.options.eventName, this.options.handler as any);
    }
  }

  onRemoved(artifact: Artifact): void {
    artifact.off(this.options.eventName, this.options.handler as any);
  }

  onReapplied(): void {}
}
