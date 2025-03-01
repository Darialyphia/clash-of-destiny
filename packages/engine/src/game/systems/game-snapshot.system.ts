import type { BetterOmit, EmptyObject, Override } from '@game/shared';
import { System } from '../../system';
import type { GameStarEvent, SerializedStarEvent } from '../game.events';
import type { SerializedUnit } from '../../unit/entities/unit.entity';
import type { SerializedPlayer } from '../../player/player.entity';
import type { GamePhase } from './game-phase.system';
import type { SerializedInteractionContext } from './interaction.system';
import type { SerializedBoard } from '../../board/board-system';

export type GameStateSnapshot<T> = {
  id: number;
  state: T;
  events: SerializedStarEvent[];
};

export type SerializedOmniscientState = {
  board: SerializedBoard;
  units: SerializedUnit[];
  players: [SerializedPlayer, SerializedPlayer];
  activePlayer: SerializedPlayer;
  elapsedTurns: number;
  interactionState: SerializedInteractionContext;
  phase: GamePhase;
};

type SerializedOpponent = Override<SerializedPlayer, { hand: number }>;

export type SerializedPlayerState = Override<
  BetterOmit<SerializedOmniscientState, 'players'>,
  {
    opponent: SerializedOpponent;
    player: SerializedPlayer;
    activePlayer: SerializedPlayer | SerializedOpponent;
  }
>;

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

  serializeOmniscientState(): SerializedOmniscientState {
    return {
      board: this.game.boardSystem.serialize(),
      units: this.game.unitSystem.units.map(unit => unit.serialize()),
      players: [
        this.game.playerSystem.player1.serialize(),
        this.game.playerSystem.player2.serialize()
      ],
      activePlayer: this.game.turnSystem.activePlayer.serialize(),
      elapsedTurns: this.game.turnSystem.elapsedTurns,
      interactionState: this.game.interaction.serialize(),
      phase: this.game.phase
    };
  }

  serializePlayerState(playerId: string): SerializedPlayerState {
    const { players, ...state } = this.serializeOmniscientState();
    const opponent = players.find(player => player.id !== playerId)!;

    return {
      ...state,
      player: players.find(player => player.id === playerId) as SerializedPlayer,
      opponent: {
        ...opponent,
        hand: opponent.hand.length
      },
      activePlayer:
        state.activePlayer.id === playerId
          ? state.activePlayer
          : {
              ...opponent,
              hand: opponent.hand.length
            }
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
