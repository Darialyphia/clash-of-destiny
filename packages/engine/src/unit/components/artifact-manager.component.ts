import type { Nullable } from '@game/shared';
import { Artifact } from '../entities/artifact.entity';
import type { ArtifactCard } from '../../card/entities/artifact-card.entity';
import { ARTIFACT_KINDS, type ArtifactKind } from '../../card/card.enums';
import type { Unit } from '../entities/unit.entity';
import { match } from 'ts-pattern';
import type { Game } from '../../game/game';

export class ArtifactManagerComponent {
  private weapon: Nullable<Artifact> = null;

  private armor: Nullable<Artifact> = null;

  private relic: Nullable<Artifact> = null;

  constructor(
    private game: Game,
    private unit: Unit
  ) {}

  get artifacts() {
    return {
      weapon: this.weapon,
      armor: this.armor,
      relic: this.relic
    };
  }

  equip(artifact: ArtifactCard) {
    return match(artifact.artifactKind)
      .with(ARTIFACT_KINDS.WEAPON, () => {
        this.weapon = new Artifact(this.game, {
          card: artifact,
          unitId: this.unit.id
        });
        return this.weapon;
      })
      .with(ARTIFACT_KINDS.ARMOR, () => {
        this.armor = new Artifact(this.game, { card: artifact, unitId: this.unit.id });
        return this.armor;
      })
      .with(ARTIFACT_KINDS.RELIC, () => {
        this.relic = new Artifact(this.game, { card: artifact, unitId: this.unit.id });
        return this.relic;
      })
      .exhaustive();
  }

  unequip(artifactKind: ArtifactKind) {
    match(artifactKind)
      .with(ARTIFACT_KINDS.WEAPON, () => {
        if (!this.weapon) return;

        this.unit.cards.sendToDiscardPile(this.weapon.card);
        this.weapon = null;
      })
      .with(ARTIFACT_KINDS.ARMOR, () => {
        if (!this.armor) return;

        this.unit.cards.sendToDiscardPile(this.armor.card);
        this.armor = null;
      })
      .with(ARTIFACT_KINDS.RELIC, () => {
        if (!this.relic) return;

        this.unit.cards.sendToDiscardPile(this.relic.card);
        this.relic = null;
      })
      .exhaustive();
  }
}
