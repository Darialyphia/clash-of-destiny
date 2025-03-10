import type { GameEventMap } from '@game/engine/src/game/game.events';
import type {
  GameStateSnapshot,
  SerializedOmniscientState,
  SerializedPlayerState
} from '@game/engine/src/game/systems/game-snapshot.system';
import type {
  InputDispatcher,
  SerializedInput
} from '@game/engine/src/input/input-system';
import { TypedEventEmitter } from '@game/engine/src/utils/typed-emitter';
import { type PartialBy, type Values } from '@game/shared';
import { defineStore } from 'pinia';

export const GAME_TYPES = {
  LOCAL: 'local',
  ONLINE: 'online'
} as const;

export type GameType = Values<typeof GAME_TYPES>;

type SerializedGameEventMap = {
  [Key in keyof GameEventMap]: ReturnType<GameEventMap[Key]['serialize']>;
};

export const useBattleStore = defineStore('battle', () => {
  const fxEmitter = new TypedEventEmitter<SerializedGameEventMap>(true);

  const isPlayingFx = ref(false);
  const isReady = ref(false);

  let dispatch: InputDispatcher = () => {};

  const playerId = ref<string>();

  const gameType = ref<GameType>();
  const state = ref<SerializedOmniscientState | SerializedPlayerState>();

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
      id: string;
    }) {
      playerId.value = id;
      dispatch = dispatcher;
      gameType.value = type;
      state.value = initialState;

      subscriber(async snapshot => {
        isPlayingFx.value = true;

        for (const event of snapshot.events) {
          await fxEmitter.emitAsync(event.eventName, event.event as any);
        }
        state.value = snapshot.state;
        isPlayingFx.value = false;
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

export const useBattleEvent = <T extends keyof GameEventMap>(
  name: T,
  handler: (eventArg: ReturnType<GameEventMap[T]['serialize']>) => Promise<void>
) => {
  const store = useBattleStore();

  const unsub = store.on(name, handler);

  onUnmounted(unsub);

  return unsub;
};

export const useGameState = () => {
  const store = useBattleStore();

  return {
    gameType: computed(() => store.gameType),
    state: computed(() => store.state)
  } as
    | {
        gameType: ComputedRef<typeof GAME_TYPES.LOCAL>;
        state: ComputedRef<SerializedOmniscientState>;
      }
    | {
        gameType: ComputedRef<typeof GAME_TYPES.ONLINE>;
        state: ComputedRef<SerializedPlayerState>;
      };
};

export const useGameType = () => {
  const store = useBattleStore();

  return computed(() => store.gameType);
};

export const useUserPlayer = () => {
  const store = useBattleStore();

  return computed(() =>
    store.playerId
      ? store.state!.players.find(p => p.id === store.playerId)!
      : store.state!.players.find(
          p => p.id === store.state!.activeUnit.playerId
        )!
  );
};

export const useOpponentPlayer = () => {
  const store = useBattleStore();

  return computed(() =>
    store.playerId
      ? store.state!.players.find(p => p.id !== store.playerId)!
      : store.state!.players.find(
          p => p.id !== store.state!.activeUnit.playerId
        )!
  );
};
