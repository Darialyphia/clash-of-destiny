import { CellViewModel } from '@/board/cell.model';
import { CardViewModel } from '@/card/card.model';
import { InteractableViewModel } from '@/interactable/interactable.model';
import { PlayerViewModel } from '@/player/player.model';
import { ArtifactViewModel } from '@/unit/artifact.model';
import { ModifierViewModel } from '@/unit/modifier.model';
import { UnitViewModel } from '@/unit/unit.model';
import {
  GAME_EVENTS,
  type GameEventMap
} from '@game/engine/src/game/game.events';
import { GAME_PHASES } from '@game/engine/src/game/systems/game-phase.system';
import type {
  EntityDictionary,
  GameStateSnapshot,
  SerializedOmniscientState,
  SerializedPlayerState
} from '@game/engine/src/game/systems/game-snapshot.system';
import type {
  InputDispatcher,
  SerializedInput
} from '@game/engine/src/input/input-system';
import { TypedEventEmitter } from '@game/engine/src/utils/typed-emitter';
import {
  waitFor,
  type Override,
  type PartialBy,
  type Values
} from '@game/shared';
import { defineStore } from 'pinia';
import { match } from 'ts-pattern';

export const GAME_TYPES = {
  LOCAL: 'local',
  ONLINE: 'online'
} as const;

export type GameType = Values<typeof GAME_TYPES>;

export type GameStateEntities = Record<
  string,
  | UnitViewModel
  | CellViewModel
  | PlayerViewModel
  | CardViewModel
  | ModifierViewModel
  | ArtifactViewModel
  | InteractableViewModel
>;
export type GameState = Override<
  SerializedOmniscientState,
  {
    entities: GameStateEntities;
  }
>;

export type PreBattleEvent<T extends keyof GameEventMap> = `pre_${T}`;
export type PreBattleEventKey<T extends keyof typeof GAME_EVENTS> = `PRE_${T}`;
export const BATTLE_EVENTS = {
  ...GAME_EVENTS,
  ...(Object.fromEntries(
    Object.entries(GAME_EVENTS).map(([key, value]) => [
      `PRE_${key}`,
      `pre_${value}`
    ])
  ) as unknown as {
    [Key in keyof typeof GAME_EVENTS as PreBattleEventKey<Key>]: PreBattleEvent<
      (typeof GAME_EVENTS)[Key]
    >;
  })
} as const;

type BattleEvent = Values<typeof BATTLE_EVENTS>;

export type BattleEventName =
  | keyof GameEventMap
  | PreBattleEvent<keyof GameEventMap>;

type SerializedGameEventMap = {
  [Key in BattleEventName]: Key extends PreBattleEvent<infer U>
    ? ReturnType<GameEventMap[U]['serialize']>
    : Key extends keyof GameEventMap
      ? ReturnType<GameEventMap[Key]['serialize']>
      : never;
};

const buildentities = (
  entities: EntityDictionary,
  dispatcher: InputDispatcher
): GameState['entities'] => {
  const result = {} as GameStateEntities;

  for (const [id, entity] of Object.entries(entities)) {
    result[id] = match(entity)
      .with(
        { entityType: 'unit' },
        entity => new UnitViewModel(entity, result, dispatcher)
      )
      .with(
        { entityType: 'cell' },
        entity => new CellViewModel(entity, result, dispatcher)
      )
      .with(
        { entityType: 'player' },
        entity => new PlayerViewModel(entity, result, dispatcher)
      )
      .with(
        { entityType: 'card' },
        entity => new CardViewModel(entity, result, dispatcher)
      )
      .with(
        { entityType: 'modifier' },
        entity => new ModifierViewModel(entity, result, dispatcher)
      )
      .with(
        { entityType: 'artifact' },
        entity => new ArtifactViewModel(entity, result, dispatcher)
      )
      .with(
        { entityType: 'interactable' },
        entity => new InteractableViewModel(entity, result, dispatcher)
      )
      .exhaustive();
  }

  return result;
};

export const useBattleStore = defineStore('battle', () => {
  const fxEmitter = new TypedEventEmitter<SerializedGameEventMap>(true);

  const isPlayingFx = ref(false);
  const isReady = ref(false);

  let dispatch: InputDispatcher = () => {};

  const playerId = ref<string | undefined>();

  const gameType = ref<GameType>();
  const state = ref<GameState>();

  return {
    init({
      subscriber,
      dispatcher,
      initialState,
      type,
      id
    }: {
      subscriber: (
        onSnapshot: (
          snapshot: GameStateSnapshot<
            SerializedOmniscientState | SerializedPlayerState
          >
        ) => void | Promise<void>
      ) => void;
      dispatcher: InputDispatcher;
      initialState: SerializedOmniscientState | SerializedPlayerState;
      type: GameType;
      id?: string;
    }) {
      playerId.value = id;
      dispatch = dispatcher;
      gameType.value = type;
      state.value = {
        ...initialState,
        entities: buildentities(initialState.entities, dispatch)
      };

      subscriber(async snapshot => {
        try {
          isPlayingFx.value = true;

          for (const event of snapshot.events) {
            await fxEmitter.emitAsync(
              `pre_${event.eventName}`,
              event.event as any
            );
            await fxEmitter.emitAsync(event.eventName, event.event as any);
          }
          isPlayingFx.value = false;
          state.value = {
            ...snapshot.state,
            entities: buildentities(snapshot.state.entities, dispatch)
          };

          if (
            gameType.value === GAME_TYPES.LOCAL &&
            state.value.phase === GAME_PHASES.BATTLE
          ) {
            playerId.value = (
              state.value.entities[state.value.activeUnit] as UnitViewModel
            ).playerId;
          }
        } catch (err) {
          console.error(err);
        }
      });

      isReady.value = true;
    },
    dispatch<T extends SerializedInput['type']>(input: {
      type: T;
      payload: PartialBy<
        (SerializedInput & { type: T })['payload'],
        'playerId'
      >;
    }) {
      dispatch({
        type: input.type,
        // @ts-expect-error distributive union issue blablabla
        payload: {
          playerId: playerId.value,
          ...input.payload
        }
      });
    },
    gameType,
    isPlayingFx: readonly(isPlayingFx),
    playerId,
    state,
    on<T extends keyof SerializedGameEventMap>(
      eventName: T,
      handler: (eventArg: SerializedGameEventMap[T]) => Promise<void>
    ) {
      return fxEmitter.on(eventName, handler);
    },

    once<T extends keyof GameEventMap>(
      eventName: T,
      handler: (eventArg: SerializedGameEventMap[T]) => Promise<void>
    ) {
      return fxEmitter.once(eventName, handler);
    },

    off<T extends keyof GameEventMap>(
      eventName: T,
      handler: (eventArg: SerializedGameEventMap[T]) => Promise<void>
    ) {
      return fxEmitter.off(eventName, handler);
    }
  };
});

export const useBattleEvent = <T extends BattleEvent>(
  name: T,
  handler: (eventArg: SerializedGameEventMap[T]) => Promise<void>
) => {
  const store = useBattleStore();

  const unsub = store.on(name, handler);

  onUnmounted(unsub);

  return unsub;
};

export const useDispatcher = () => {
  const store = useBattleStore();

  return store.dispatch;
};

export const useGameState = () => {
  const store = useBattleStore();

  return {
    gameType: computed(() => store.gameType),
    state: computed(() => store.state!)
  };
};

export const useGameType = () => {
  const store = useBattleStore();

  return computed(() => store.gameType);
};

const usePlayers = () => {
  const { state } = useGameState();

  return computed(() =>
    state.value.players.map(p => state.value.entities[p] as PlayerViewModel)
  );
};

export const useCells = () => {
  const { state } = useGameState();

  return computed(() =>
    state.value.board.cells.map(c => state.value.entities[c] as CellViewModel)
  );
};

export const useUnits = () => {
  const { state } = useGameState();

  return computed(() =>
    state.value.units.map(u => state.value.entities[u] as UnitViewModel)
  );
};

export const useCards = () => {
  const { state } = useGameState();

  return computed(() =>
    Object.values(state.value.entities).filter(e => e instanceof CardViewModel)
  );
};

export const useModifiers = () => {
  const { state } = useGameState();

  return computed(() =>
    Object.values(state.value.entities).filter(
      e => e instanceof ModifierViewModel
    )
  );
};

export const useActiveUnit = () => {
  const { state } = useGameState();

  return computed(
    () => state.value.entities[state.value.activeUnit] as UnitViewModel
  );
};

export const useUserPlayer = () => {
  const store = useBattleStore();
  const players = usePlayers();
  const activeUnit = useActiveUnit();

  return computed(() =>
    store.playerId
      ? players.value.find(p => p.id === store.playerId)!
      : players.value.find(p => p.id === activeUnit.value.id)!
  );
};

export const useOpponentPlayer = () => {
  const store = useBattleStore();
  const players = usePlayers();
  const activeUnit = useActiveUnit();

  return computed(() =>
    store.playerId
      ? players.value.find(p => p.id !== store.playerId)!
      : players.value.find(p => p.id !== activeUnit.value.id)!
  );
};
