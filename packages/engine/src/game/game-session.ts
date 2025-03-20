import { type BetterOmit } from '@game/shared';
import { Game, type GameOptions } from './game';
import type { SerializedInput } from '../input/input-system';
import type {
  GameStateSnapshot,
  SerializedOmniscientState,
  SerializedPlayerState
} from './systems/game-snapshot.system';
import { GAME_EVENTS } from './game.events';

export type GameSessionOptions = BetterOmit<GameOptions, 'id'> & {
  id?: string;
};

export class GameSession {
  readonly game: Game;

  constructor(options: GameSessionOptions) {
    this.game = new Game({
      id: options.id ?? 'GAME_SESSION',
      rngSeed: options.rngSeed,
      mapId: options.mapId,
      history: options.history,
      isSimulation: options.isSimulation,
      players: options.players,
      overrides: options.overrides
    });
  }

  initialize() {
    return this.game.initialize();
  }

  subscribe<
    TPlayerId extends string | null,
    TSnapshot extends TPlayerId extends string
      ? SerializedPlayerState
      : SerializedOmniscientState
  >(playerId: TPlayerId, cb: (snapshot: GameStateSnapshot<TSnapshot>) => void) {
    this.game.on(GAME_EVENTS.FLUSHED, () => {
      if (playerId) {
        cb(
          this.game.snapshotSystem.getLatestSnapshotForPlayer(
            playerId
          ) as GameStateSnapshot<TSnapshot>
        );
      } else {
        cb(
          this.game.snapshotSystem.getLatestOmniscientSnapshot() as GameStateSnapshot<TSnapshot>
        );
      }
    });
  }

  dispatch(input: SerializedInput) {
    this.game.dispatch(input);
  }

  simulateDispatch(playerId: string, input: SerializedInput) {
    return this.game.simulateDispatch(playerId, input);
  }
}
