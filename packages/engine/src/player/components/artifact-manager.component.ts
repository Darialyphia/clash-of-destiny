import { Artifact } from '../../unit/entities/artifact.entity';
import type { ArtifactCard } from '../../card/entities/artifact-card.entity';
import type { Game } from '../../game/game';
import type { Player } from '../player.entity';

export class ArtifactManagerComponent {
  readonly artifacts: Artifact[] = [];

  constructor(
    private game: Game,
    private player: Player
  ) {}

  equip(artifactCard: ArtifactCard) {
    const artifact = new Artifact(this.game, {
      card: artifactCard
    });
    this.artifacts.push(artifact);

    return artifact;
  }

  unequip(artifact: Artifact) {
    const index = this.artifacts.findIndex(a => a.equals(artifact));
    if (index !== -1) {
      this.artifacts.splice(index, 1);
    }
  }
}
