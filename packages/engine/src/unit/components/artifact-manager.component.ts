import type { Nullable } from '@game/shared';
import { Artifact } from '../entities/artifact.entity';
import type { ArtifactCard } from '../../card/entities/artifact-card.entity';
import { ARTIFACT_KINDS, type ArtifactKind } from '../../card/card.enums';
import type { Unit } from '../entities/unit.entity';
import { match } from 'ts-pattern';
import type { Game } from '../../game/game';

export class ArtifactManagerComponent {
  private weapon: Nullable<Artifact> = null;

  private amor: Nullable<Artifact> = null;

  private relic: Nullable<Artifact> = null;

  constructor(
    private game: Game,
    private unit: Unit
  ) {}

  get artifacts() {
    return {
      weapon: this.weapon,
      amor: this.amor,
      relic: this.relic
    };
  }

  equipArtifact(artifact: ArtifactCard) {
    return match(artifact.artifactKind)
      .with(ARTIFACT_KINDS.WEAPON, () => {
        this.weapon = new Artifact(this.game, {
          card: artifact,
          unitId: this.unit.id
        });
      })
      .with(ARTIFACT_KINDS.ARMOR, () => {
        this.amor = new Artifact(this.game, { card: artifact, unitId: this.unit.id });
      })
      .with(ARTIFACT_KINDS.RELIC, () => {
        this.relic = new Artifact(this.game, { card: artifact, unitId: this.unit.id });
      })
      .exhaustive();
  }

  unequipArtifact(artifactKind: ArtifactKind) {
    match(artifactKind)
      .with(ARTIFACT_KINDS.WEAPON, () => {
        if (!this.weapon) return;

        this.unit.sendToDiscardPile(this.weapon.card);
        this.weapon = null;
      })
      .with(ARTIFACT_KINDS.ARMOR, () => {
        if (!this.amor) return;

        this.unit.sendToDiscardPile(this.amor.card);
        this.amor = null;
      })
      .with(ARTIFACT_KINDS.RELIC, () => {
        if (!this.relic) return;

        this.unit.sendToDiscardPile(this.relic.card);
        this.relic = null;
      })
      .exhaustive();
  }
}
