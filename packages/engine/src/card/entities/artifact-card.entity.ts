import type { Game } from '../../game/game';
import type { Player } from '../../player/player.entity';
import { Interceptable } from '../../utils/interceptable';
import type { ArtifactBlueprint } from '../card-blueprint';
import { CARD_EVENTS, CARD_KINDS } from '../card.enums';
import {
  CardAfterPlayEvent,
  CardBeforePlayEvent,
  type CardEventMap
} from '../card.events';
import {
  Card,
  makeCardInterceptors,
  type CardInterceptors,
  type CardOptions,
  type SerializedCard
} from './card.entity';

export type SerializedArtifactCard = SerializedCard & {
  kind: typeof CARD_KINDS.ARTIFACT;
  job: string;
  durability: number;
};
export type ArtifactCardEventMap = CardEventMap;
export type ArtifactCardInterceptors = CardInterceptors & {
  canPlay: Interceptable<boolean, ArtifactCard>;
};

export class ArtifactCard extends Card<
  SerializedCard,
  ArtifactCardEventMap,
  ArtifactCardInterceptors,
  ArtifactBlueprint
> {
  constructor(game: Game, player: Player, options: CardOptions<ArtifactBlueprint>) {
    super(
      game,
      player,
      { ...makeCardInterceptors(), canPlay: new Interceptable() },
      options
    );
  }

  canPlay(): boolean {
    return this.interceptors.canPlay.getValue(
      this.fulfillsAffinity && this.fulfillsResourceCost,
      this
    );
  }

  play() {
    this.emitter.emit(CARD_EVENTS.BEFORE_PLAY, new CardBeforePlayEvent({ targets: [] }));

    const artifact = this.player.artifacts.equip(this);

    this.blueprint.onPlay(this.game, this, artifact);

    this.emitter.emit(CARD_EVENTS.AFTER_PLAY, new CardAfterPlayEvent({ targets: [] }));
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
      affinity: this.blueprint.affinity,
      setId: this.blueprint.setId,
      name: this.blueprint.name,
      description: this.blueprint.getDescription(this.game, this),
      rarity: this.blueprint.rarity,
      player: this.player.id,
      job: this.blueprint.job,
      durability: this.blueprint.durability,
      canPlay: this.player.canPlayCard(this),
      abilities: this.abilities.map(ability => ({
        id: ability.id,
        manaCost: ability.manaCost,
        label: ability.label,
        canUse: this.canUseAbiliy(ability.id),
        isCardAbility: ability.isCardAbility
      }))
    };
  }
}
