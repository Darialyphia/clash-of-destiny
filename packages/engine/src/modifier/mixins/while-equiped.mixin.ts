import type { Game } from '../../game/game';
import { ARTIFACT_EVENTS, type Artifact } from '../../player/artifact.entity';
import { ModifierMixin } from '../modifier-mixin';
import type { Modifier } from '../modifier.entity';

export class WhileEquipedModifierMixin extends ModifierMixin<Artifact> {
  constructor(
    game: Game,
    private options: {
      onApplied: (modifier: Modifier<Artifact>) => void;
      onRemoved: (modifier: Modifier<Artifact>) => void;
    }
  ) {
    super(game);
  }

  onApplied(target: Artifact, modifier: Modifier<Artifact>): void {
    this.options.onApplied(modifier);

    [ARTIFACT_EVENTS.AFTER_DESTROY].forEach(event => {
      target.once(event, () => {
        this.options.onRemoved(modifier);
      });
    });
  }

  onRemoved(target: Artifact, modifier: Modifier<Artifact>): void {
    this.options.onRemoved(modifier);
  }

  onReapplied(): void {}
}
