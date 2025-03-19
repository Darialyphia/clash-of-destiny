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
  private cleanup: (() => void) | null = null;

  constructor(
    game: Game,
    private options: {
      eventName: TEvent;
      handler: (
        event: UnitEventMap[TEvent],
        target: Unit,
        modifier: Modifier<Unit>
      ) => void;
      once?: boolean;
    }
  ) {
    super(game);
  }

  onApplied(unit: Unit, modifier: Modifier<Unit>): void {
    this.modifier = modifier;
    if (this.options.once) {
      this.cleanup = unit.once(this.options.eventName, event =>
        this.options.handler(event, unit, modifier)
      );
    } else {
      this.cleanup = unit.on(this.options.eventName, event =>
        this.options.handler(event, unit, modifier)
      );
    }
  }

  onRemoved(): void {
    if (this.cleanup) {
      this.cleanup();
    }
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
