import type { Game } from '../../game/game';
import type { Player } from '../../player/player.entity';
import type { Unit } from '../../unit/entities/unit.entity';
import type { ArtifactBlueprint } from '../card-blueprint';
import { CARD_EVENTS, CARD_KINDS } from '../card.enums';
import {
  CardAfterPlayEvent,
  CardBeforePlayEvent,
  type CardEventMap
} from '../card.events';
import { Card, type CardOptions, type SerializedCard } from './card.entity';
import { makeUnitCardInterceptors, type UnitCardInterceptors } from './unit-card.entity';

export type SerializedArtifactCard = SerializedCard & {
  kind: typeof CARD_KINDS.ARTIFACT;
};
export type ArtifactCardEventMap = CardEventMap;
export type ArtifactCardInterceptors = UnitCardInterceptors;

export class ArtifactCard extends Card<
  SerializedCard,
  ArtifactCardEventMap,
  ArtifactCardInterceptors,
  ArtifactBlueprint
> {
  constructor(game: Game, player: Player, options: CardOptions<ArtifactBlueprint>) {
    super(game, player, makeUnitCardInterceptors(), options);
  }

  canPlay(): boolean {
    return true;
  }

  play() {
    this.emitter.emit(CARD_EVENTS.BEFORE_PLAY, new CardBeforePlayEvent({ targets: [] }));

    const artifact = this.player.artifacts.equip(this);

    this.blueprint.onPlay(this.game, this, artifact);

    this.emitter.emit(CARD_EVENTS.AFTER_PLAY, new CardAfterPlayEvent({ targets: [] }));
  }

  get manaCost() {
    return 0;
  }

  get abilities() {
    return this.blueprint.abilities;
  }

  get durability() {
    return this.blueprint.durability;
  }

  get artifactKind() {
    return this.blueprint.artifactKind;
  }

  serialize(): SerializedArtifactCard {
    return {
      id: this.id,
      entityType: 'card' as const,
      blueprintId: this.blueprint.id,
      deckSource: this.deckSource,
      destinyCost: this.destinyCost,
      manaCost: this.manaCost,
      iconId: this.blueprint.cardIconId,
      kind: this.blueprint.kind,
      setId: this.blueprint.setId,
      name: this.blueprint.name,
      description: this.blueprint.getDescription(this.game, this),
      rarity: this.blueprint.rarity,
      unit: this.player.id,
      canPlay: this.player.canPlayCard(this)
    };
  }
}
