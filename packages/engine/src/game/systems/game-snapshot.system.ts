import type { EmptyObject } from '@game/shared';
import { System } from '../../system';
import type { GameStarEvent, SerializedStarEvent } from '../game.events';
import type { SerializedUnit } from '../../unit/entities/unit.entity';
import type { SerializedPlayer } from '../../player/player.entity';
import type { GamePhase } from './game-phase.system';
import type { SerializedInteractionContext } from './interaction.system';
import type { SerializedBoard } from '../../board/board-system';
import type { SerializedCell } from '../../board/cell';
import type { SerializedCard } from '../../card/entities/card.entity';
import type { SerializedModifier } from '../../modifier/modifier.entity';
import type { SerializedArtifact } from '../../player/artifact.entity';
import type { SerializedInteractable } from '../../interactable/interactable.entity';

export type GameStateSnapshot<T> = {
  id: number;
  state: T;
  events: SerializedStarEvent[];
};

export type EntityDictionary = Record<
  string,
  | SerializedCell
  | SerializedCard
  | SerializedUnit
  | SerializedModifier
  | SerializedPlayer
  | SerializedArtifact
  | SerializedInteractable
>;

export type SerializedOmniscientState = {
  entities: EntityDictionary;
  board: SerializedBoard;
  units: string[];
  interactables: string[];
  players: [string, string];
  activePlayer: string;
  turnCount: number;
  interactionState: SerializedInteractionContext;
  phase: GamePhase;
};

export type SerializedOpponentUnit = SerializedUnit;
export type SerializedPlayerState = SerializedOmniscientState;

export class GameSnaphotSystem extends System<EmptyObject> {
  private playerCaches: Record<string, GameStateSnapshot<SerializedPlayerState>[]> = {
    omniscient: []
  };
  private omniscientCache: GameStateSnapshot<SerializedOmniscientState>[] = [];

  private eventsSinceLastSnapshot: GameStarEvent[] = [];

  private nextId = 0;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  initialize(): void {
    this.game.on('*', event => {
      this.eventsSinceLastSnapshot.push(event);
    });
    this.playerCaches[this.game.playerSystem.player1.id] = [];
    this.playerCaches[this.game.playerSystem.player2.id] = [];
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  shutdown() {}

  getOmniscientSnapshotAt(index: number): GameStateSnapshot<SerializedOmniscientState> {
    const snapshot = this.omniscientCache[index];
    if (!snapshot) {
      throw new Error(`Gamestate snapshot unavailable for index ${index}`);
    }

    return snapshot;
  }

  geSnapshotForPlayerAt(
    playerId: string,
    index: number
  ): GameStateSnapshot<SerializedPlayerState> {
    const snapshot = this.playerCaches[playerId][index];
    if (!snapshot) {
      throw new Error(`Gamestate snapshot unavailable for index ${index}`);
    }

    return snapshot;
  }

  getLatestOmniscientSnapshot(): GameStateSnapshot<SerializedOmniscientState> {
    return this.getOmniscientSnapshotAt(this.nextId - 1);
  }

  getLatestSnapshotForPlayer(playerId: string): GameStateSnapshot<SerializedPlayerState> {
    return this.geSnapshotForPlayerAt(playerId, this.nextId - 1);
  }

  private buildEntityDictionary(): EntityDictionary {
    const entities: EntityDictionary = {};

    this.game.boardSystem.cells.forEach(cell => {
      entities[cell.id] = cell.serialize();
    });
    this.game.unitSystem.units.forEach(unit => {
      entities[unit.id] = unit.serialize();

      unit.modifiers.forEach(modifier => {
        entities[modifier.id] = modifier.serialize();
      });

      entities[unit.card.id] = unit.card.serialize();
    });

    this.game.interactableSystem.interactables.forEach(interactable => {
      entities[interactable.id] = interactable.serialize();
    });

    this.game.playerSystem.players.forEach(player => {
      entities[player.id] = player.serialize();

      player.artifacts.artifacts.forEach(artifact => {
        entities[artifact.id] = artifact.serialize();
        entities[artifact.card.id] = artifact.card.serialize();
      });

      if (player.currentlyPlayedCard) {
        entities[player.currentlyPlayedCard.id] = player.currentlyPlayedCard.serialize();
      }
      player.cards.hand.forEach(card => {
        entities[card.id] = card.serialize();
      });
      player.cards.discardPile.forEach(card => {
        entities[card.id] = card.serialize();
      });
    });

    this.game.interaction.getEntities().forEach(entity => {
      entities[entity.id] = entity.serialize();
    });
    return entities;
  }

  serializeOmniscientState(): SerializedOmniscientState {
    return {
      entities: this.buildEntityDictionary(),
      activePlayer: this.game.turnSystem.activePlayer.id,
      turnCount: this.game.turnSystem.elapsedTurns,
      interactionState: this.game.interaction.serialize(),
      phase: this.game.phase,
      board: this.game.boardSystem.serialize(),
      units: this.game.unitSystem.units.map(unit => unit.id),
      interactables: this.game.interactableSystem.interactables.map(unit => unit.id),
      players: this.game.playerSystem.players.map(player => player.id) as [string, string]
    };
  }

  serializePlayerState(playerId: string): SerializedPlayerState {
    const state = this.serializeOmniscientState();

    return {
      ...state,
      entities: Object.fromEntries(
        Object.entries(state.entities).map(([id, entity]) => [id, entity])
      )
    };
  }

  takeSnapshot() {
    const events = this.eventsSinceLastSnapshot.map(event => event.serialize());
    const id = this.nextId++;
    this.playerCaches[this.game.playerSystem.player1.id].push({
      id,
      events,
      state: this.serializePlayerState(this.game.playerSystem.player1.id)
    });

    this.playerCaches[this.game.playerSystem.player2.id].push({
      id,
      events,
      state: this.serializePlayerState(this.game.playerSystem.player2.id)
    });

    this.omniscientCache.push({
      id,
      events,
      state: this.serializeOmniscientState()
    });

    this.eventsSinceLastSnapshot = [];
  }
}
