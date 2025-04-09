import type { AnyCard } from '../../card/entities/card.entity';
import type { HeroCard } from '../../card/entities/hero-card.entity';
import type { MinionCard } from '../../card/entities/minion-card.entity';
import type { SecretCard } from '../../card/entities/secret-card.entity';
import type { ShrineCard } from '../../card/entities/shrine-card.entity';
import type { SpellCard } from '../../card/entities/spell-card.entity';
import type { Game } from '../../game/game';
import { Artifact } from '../../player/artifact.entity';
import { Unit } from '../../unit/entities/unit.entity';
import { ModifierMixin } from '../modifier-mixin';
import type { Modifier } from '../modifier.entity';

export class ClassBonusModifierMixin<
  T extends MinionCard | SpellCard | Artifact | SecretCard | Unit | Artifact
> extends ModifierMixin<T> {
  constructor(
    protected game: Game,
    protected onJobMatchApplied: (target: T, modifier: Modifier<T>) => void,
    protected onJobMatchRemoved: (target: T, modifier: Modifier<T>) => void
  ) {
    super(game);
  }

  private getJob(target: T) {
    if (target instanceof Unit || target instanceof Artifact) {
      return target.card.job;
    }

    return target.job;
  }

  onApplied(target: T, modifier: Modifier<T>): void {
    if (target.player.hero.card.job === this.getJob(target)) {
      this.onJobMatchApplied(target, modifier);
    }
  }

  onRemoved(target: T, modifier: Modifier<T>): void {
    if (target.player.hero.card.job === this.getJob(target)) {
      this.onJobMatchRemoved(target, modifier);
    }
  }

  onReapplied() {}
}
