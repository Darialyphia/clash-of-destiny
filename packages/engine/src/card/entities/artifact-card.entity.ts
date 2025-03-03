import type { Game } from '../../game/game';
import type { Player } from '../../player/player.entity';
import type { ArtifactBlueprint } from '../card-blueprint';
import { CARD_KINDS } from '../card.enums';
import type { CardEventMap } from '../card.events';
import { Card, type CardOptions, type SerializedCard } from './card.entity';

export type SerializedArtifactCard = SerializedCard & {
  kind: typeof CARD_KINDS.ARTIFACT;
};
export type ArtifactCardEventMap = CardEventMap;
export type ArtifactCardInterceptors = Record<string, never>;

export class ArtifactCard extends Card<
  SerializedCard,
  ArtifactCardEventMap,
  ArtifactCardInterceptors,
  ArtifactBlueprint
> {
  constructor(game: Game, player: Player, options: CardOptions<ArtifactBlueprint>) {
    super(game, player, {}, options);
  }

  play() {}

  get manaCost() {
    return this.blueprint.manaCost;
  }

  get artifactKind() {
    return this.blueprint.artifactKind;
  }

  serialize(): SerializedArtifactCard {
    return {
      id: this.id,
      blueprintId: this.blueprint.id,
      kind: this.blueprint.kind,
      setId: this.blueprint.setId,
      name: this.blueprint.name,
      description: this.blueprint.description,
      rarity: this.blueprint.rarity
    };
  }
}
