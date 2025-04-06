import { InputSystem, type SerializedInput } from '../input/input-system';
import { defaultConfig, type Config } from '../config';
import { TypedSerializableEventEmitter } from '../utils/typed-emitter';
import { RngSystem } from '../rng/rng.system';
import { GamePhaseSystem } from './systems/game-phase.system';
import { GameSnaphotSystem } from './systems/game-snapshot.system';
import { PlayerSystem } from '../player/player.system';
import {
  GAME_EVENTS,
  GameReadyEvent,
  GameStarEvent,
  type GameEventMap
} from './game.events';
import { createCard, cardIdFactory } from '../card/card.factory';
import type { IndexedRecord } from '@game/shared';
import type { CardBlueprint } from '../card/card-blueprint';
import { BoardSystem } from '../board/board-system';
import { UnitSystem } from '../unit/unit-system';
import type { Player, PlayerOptions } from '../player/player.entity';
import type { MapBlueprint } from '../board/map-blueprint';
import { CARDS_DICTIONARY } from '../card/sets';
import { MAPS_DICTIONARY } from '../board/maps/_index';
import { InteractionSystem } from './systems/interaction.system';
import { modifierIdFactory } from '../modifier/modifier.entity';
import { InteractableSystem } from '../interactable/interactable.system';
import { GAME_PHASES } from './game.enums';

export type GameOptions = {
  id: string;
  rngSeed: string;
  mapId: string;
  history?: SerializedInput[];
  overrides: Partial<{
    cardPool: IndexedRecord<CardBlueprint, 'id'>;
    mapPool: IndexedRecord<MapBlueprint, 'id'>;
    config: Partial<Config>;
    winCondition: (game: Game, player: Player) => boolean;
  }>;
  isSimulation?: boolean;
  players: [PlayerOptions, PlayerOptions];
};

export class Game {
  readonly id: string;

  private readonly emitter = new TypedSerializableEventEmitter<GameEventMap>();

  readonly config: Config;

  readonly rngSystem = new RngSystem(this);

  readonly inputSystem = new InputSystem(this);

  readonly gamePhaseSystem = new GamePhaseSystem(this);

  readonly snapshotSystem = new GameSnaphotSystem(this);

  readonly playerSystem = new PlayerSystem(this);

  readonly boardSystem = new BoardSystem(this);

  readonly unitSystem = new UnitSystem(this);

  readonly interactableSystem = new InteractableSystem(this);

  readonly interaction = new InteractionSystem(this);

  readonly isSimulation: boolean;

  readonly cardFactory = createCard;

  readonly cardIdFactory = cardIdFactory();

  readonly modifierIdFactory = modifierIdFactory();

  readonly cardPool: IndexedRecord<CardBlueprint, 'id'>;

  readonly mapPool: IndexedRecord<MapBlueprint, 'id'>;

  private winCondition!: (game: Game, player: Player) => boolean;

  private nextSimulationId = 0;

  constructor(readonly options: GameOptions) {
    this.id = options.id;
    this.cardPool = options.overrides.cardPool ?? CARDS_DICTIONARY;
    this.mapPool = options.overrides.mapPool ?? MAPS_DICTIONARY;
    this.config = Object.assign({}, defaultConfig, options.overrides.config);
    this.isSimulation = options.isSimulation ?? false;
    this.winCondition = options.overrides.winCondition ?? this.defaultWinCondition;
    this.setupStarEvents();
  }

  defaultWinCondition(game: Game, player: Player) {
    return !player.enemyUnits.some(unit => unit.isHero || unit.isShrine);
  }

  // the event emitter doesnt provide the event name if you enable wildcards, so let's implement it ourselves
  private setupStarEvents() {
    Object.values(GAME_EVENTS).forEach(eventName => {
      this.on(eventName as any, event => {
        console.log(eventName);

        this.emit('*', new GameStarEvent({ e: { event, eventName } }));
      });
    });
  }

  initialize() {
    this.rngSystem.initialize({ seed: this.options.rngSeed });
    this.inputSystem.initialize(this.options.history ?? []);
    this.boardSystem.initialize({
      map: this.mapPool[this.options.mapId]
    });
    this.unitSystem.initialize();
    this.interactableSystem.initialize();
    this.playerSystem.initialize({
      players: this.options.players
    });
    this.gamePhaseSystem.initialize();
    this.interaction.initialize();
    this.snapshotSystem.initialize();
    const stop = this.on('*', e => {
      if (this.gamePhaseSystem.phase === GAME_PHASES.GAME_END) return;
      for (const player of this.playerSystem.players) {
        if (this.winCondition(this, player)) {
          this.gamePhaseSystem.declareWinner(player);
          stop();
          break;
        }
      }
    });
    this.gamePhaseSystem.turnPlayer.startTurn();
    this.snapshotSystem.takeSnapshot();
    this.emit(GAME_EVENTS.READY, new GameReadyEvent({}));
  }

  get on() {
    return this.emitter.on.bind(this.emitter);
  }

  get once() {
    return this.emitter.once.bind(this.emitter);
  }

  get off() {
    return this.emitter.off.bind(this.emitter);
  }

  get emit() {
    return this.emitter.emit.bind(this.emitter);
  }

  get phase() {
    return this.gamePhaseSystem.phase;
  }

  dispatch(input: SerializedInput) {
    this.inputSystem.dispatch(input);
  }

  shutdown() {
    this.emitter.removeAllListeners();
  }

  clone(id: number) {
    const game = new Game({
      ...this.options,
      id: `simulation_${id}`,
      history: this.inputSystem.serialize()
    });
    game.initialize();

    return game;
  }

  simulateDispatch(playerId: string, input: SerializedInput) {
    const game = this.clone(++this.nextSimulationId);
    game.dispatch(input);
    game.snapshotSystem.takeSnapshot();

    return game.snapshotSystem.getLatestSnapshotForPlayer(playerId);
  }
}
