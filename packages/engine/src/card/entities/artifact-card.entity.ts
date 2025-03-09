import type { Game } from '../../game/game';
import type { Unit } from '../../unit/entities/unit.entity';
import type { ArtifactBlueprint } from '../card-blueprint';
import { CARD_EVENTS, CARD_KINDS } from '../card.enums';
import {
  CardAfterPlayEvent,
  CardBeforePlayEvent,
  type CardEventMap
} from '../card.events';
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
  constructor(game: Game, unit: Unit, options: CardOptions<ArtifactBlueprint>) {
    super(game, unit, {}, options);
  }

  canPlay(): boolean {
    return this.manaCost <= this.unit.mp.current;
  }

  play() {
    this.emitter.emit(CARD_EVENTS.BEFORE_PLAY, new CardBeforePlayEvent({ targets: [] }));

    const artifact = this.unit.artifacts.equip(this);

    this.blueprint.onPlay(this.game, this, artifact);

    this.emitter.emit(CARD_EVENTS.AFTER_PLAY, new CardAfterPlayEvent({ targets: [] }));
  }

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
