import { assert } from '@game/shared';
import type { Game } from '../../game/game';
import { GameCardEvent } from '../../game/game.events';
import type { SelectedTarget } from '../../game/systems/interaction.system';
import type { Player } from '../../player/player.entity';
import { Interceptable } from '../../utils/interceptable';
import type { ArtifactBlueprint } from '../card-blueprint';
import { NotEnoughManaError } from '../card-errors';
import { CARD_EVENTS } from '../card.enums';
import {
  CardBeforePlayEvent,
  CardAfterPlayEvent,
  type CardEventMap
} from '../card.events';
import { Card, type CardOptions, type SerializedCard } from './card.entity';
import { TooManyArtifactsError } from '../../player/player-errors';
import { PlayerArtifact } from '../../player/player-artifact.entity';

export type SerializedArtifactCard = SerializedCard & {
  durability: number;
  manaCost: number;
};

const makeInterceptors = () => ({
  manaCost: new Interceptable<number>(),
  durability: new Interceptable<number>()
});

export type ArtifactCardInterceptor = ReturnType<typeof makeInterceptors>;

export class ArtifactCard extends Card<
  SerializedArtifactCard,
  CardEventMap,
  ArtifactCardInterceptor,
  ArtifactBlueprint
> {
  constructor(game: Game, player: Player, options: CardOptions) {
    super(game, player, makeInterceptors(), options);
    this.forwardListeners();
    this.blueprint.onInit(this.game, this);
  }

  get hasEnoughMana() {
    return this.manaCost <= this.player.mana;
  }

  selectTargets(onComplete: (targets: SelectedTarget[]) => void) {
    this.game.interaction.startSelectingTargets({
      player: this.player,
      getNextTarget: targets => {
        return (
          this.blueprint.followup.getTargets(this.game, this)[targets.length] ?? null
        );
      },
      canCommit: this.blueprint.followup.canCommit,
      onComplete
    });
  }

  play() {
    assert(this.hasEnoughMana, new NotEnoughManaError());
    assert(this.player.canEquipArtifact, new TooManyArtifactsError());
    this.selectTargets(this.playWithTargets.bind(this));
  }

  playWithTargets(targets: SelectedTarget[]) {
    const points = targets.map(t => t.cell);

    this.emitter.emit(
      CARD_EVENTS.BEFORE_PLAY,
      new CardBeforePlayEvent({ targets: points })
    );

    const artifact = new PlayerArtifact(this.game, {
      card: this,
      playerId: this.player.id
    });
    this.player.equipArtifact(artifact);

    const aoeShape = this.blueprint.getAoe(this.game, this, points);
    this.blueprint.onPlay(
      this.game,
      this,
      artifact,
      aoeShape.getCells(points),
      aoeShape.getUnits(points)
    );

    this.emitter.emit(
      CARD_EVENTS.AFTER_PLAY,
      new CardAfterPlayEvent({ targets: points })
    );
  }

  get durability(): number {
    return this.interceptors.durability.getValue(this.blueprint.durability, {});
  }

  get manaCost() {
    return this.interceptors.manaCost.getValue(this.blueprint.manaCost, {});
  }

  serialize(): SerializedArtifactCard {
    return {
      id: this.id,
      name: this.name,
      blueprintId: this.blueprint.id,
      description: this.description,
      canPlay: this.hasEnoughMana && this.player.canEquipArtifact,
      kind: this.kind,
      manaCost: this.manaCost,
      rarity: this.rarity,
      faction: this.faction?.serialize() ?? null,
      setId: this.blueprint.setId,
      durability: this.durability,
      elligibleFirstTarget: this.game.boardSystem.cells
        .filter(cell =>
          this.blueprint.followup.getTargets(this.game, this)[0]?.isElligible(cell)
        )
        .map(cell => cell.position.serialize()),
      modifiers: this.modifiers.map(modifier => modifier.serialize())
    };
  }

  forwardListeners() {
    Object.values(CARD_EVENTS).forEach(eventName => {
      this.on(eventName, event => {
        this.game.emit(
          `card.${eventName}`,
          new GameCardEvent({ card: this, event: event as any }) as any
        );
      });
    });
  }
}
