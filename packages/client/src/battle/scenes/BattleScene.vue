<script lang="ts" setup>
import { config } from '@/utils/config';
import IsoWorld from '@/iso/components/IsoWorld.vue';
import IsoCamera from '@/iso/components/IsoCamera.vue';
import { useKeyboardControl } from '@/shared/composables/useKeyboardControl';
import { useSettingsStore } from '@/shared/composables/useSettings';
import { until } from '@vueuse/core';
import { useBattleStore, useGameState } from '../stores/battle.store';
import { useBattleUiStore } from '../stores/battle-ui.store';
import Board from '@/board/scenes/Board.vue';
import { GameSession } from '@game/engine/src/game/game-session';

const battleStore = useBattleStore();
const settingsStore = useSettingsStore();
const uiStore = useBattleUiStore();
const { state } = useGameState();
const isoWorld = useTemplateRef('isoWorld');

const session = new GameSession({
  mapId: '1v1',
  rngSeed: 'test',
  history: [],
  overrides: {},
  players: [
    {
      id: 'p1',
      name: 'Player 1',
      heroes: [
        {
          blueprintId: 'archMage',
          deck: {
            cards: [
              ...Array.from({ length: 4 }, () => 'magic-missile'),
              ...Array.from({ length: 4 }, () => 'arcane-knowledge'),
              ...Array.from({ length: 4 }, () => 'mana-shield'),
              ...Array.from({ length: 4 }, () => 'frost-nova'),
              ...Array.from({ length: 4 }, () => 'force-wave')
            ]
          }
        },
        {
          blueprintId: 'exorcist',
          deck: {
            cards: [
              ...Array.from({ length: 4 }, () => 'inspire'),
              ...Array.from({ length: 4 }, () => 'purify'),
              ...Array.from({ length: 4 }, () => 'cure-wounds'),
              ...Array.from({ length: 4 }, () => 'equinox'),
              ...Array.from({ length: 4 }, () => 'pacify')
            ]
          }
        },
        {
          blueprintId: 'archMage',
          deck: {
            cards: [
              ...Array.from({ length: 4 }, () => 'cone-of-flames'),
              ...Array.from({ length: 4 }, () => 'magic-missile'),
              ...Array.from({ length: 4 }, () => 'arcane-knowledge'),
              ...Array.from({ length: 4 }, () => 'mana-shield'),
              ...Array.from({ length: 4 }, () => 'magic-amplification')
            ]
          }
        }
      ]
    },
    {
      id: 'p2',
      name: 'Player 2',
      heroes: [
        {
          blueprintId: 'archMage',
          deck: {
            cards: [
              ...Array.from({ length: 4 }, () => 'magic-missile'),
              ...Array.from({ length: 4 }, () => 'arcane-knowledge'),
              ...Array.from({ length: 4 }, () => 'mana-shield'),
              ...Array.from({ length: 4 }, () => 'staff-of-focus'),
              ...Array.from({ length: 4 }, () => 'magic-amplification')
            ]
          }
        },
        {
          blueprintId: 'exorcist',
          deck: {
            cards: [
              ...Array.from({ length: 4 }, () => 'inspire'),
              ...Array.from({ length: 4 }, () => 'purify'),
              ...Array.from({ length: 4 }, () => 'cure-wounds'),
              ...Array.from({ length: 4 }, () => 'equinox'),
              ...Array.from({ length: 4 }, () => 'pacify')
            ]
          }
        },
        {
          blueprintId: 'archMage',
          deck: {
            cards: [
              ...Array.from({ length: 4 }, () => 'magic-missile'),
              ...Array.from({ length: 4 }, () => 'arcane-knowledge'),
              ...Array.from({ length: 4 }, () => 'mana-shield'),
              ...Array.from({ length: 4 }, () => 'staff-of-focus'),
              ...Array.from({ length: 4 }, () => 'magic-amplification')
            ]
          }
        }
      ]
    }
  ]
});
// @ts-expect-error
window._debugSession = () => {
  console.log(session.game);
};
// @ts-expect-error
window._debugClient = () => {
  console.log(battleStore.state);
};
session.initialize();
battleStore.init({
  id: 'p1',
  type: 'local',
  subscriber(onSnapshot) {
    session.subscribe(null, onSnapshot);
  },
  initialState: session.game.snapshotSystem.getLatestOmniscientSnapshot().state,
  dispatcher: input => {
    session.dispatch(input);
  }
});

useKeyboardControl(
  'keydown',
  () => settingsStore.settings.bindings.rotateCW.control,
  () => isoWorld.value?.camera.rotateCW()
);
useKeyboardControl(
  'keydown',
  () => settingsStore.settings.bindings.rotateCCW.control,
  () => isoWorld.value?.camera.rotateCCW()
);

useKeyboardControl(
  'keydown',
  () => settingsStore.settings.bindings.endTurn.control,
  () =>
    battleStore.dispatch({
      type: 'endTurn',
      payload: {}
    })
);
const ui = useBattleUiStore();
until(() => isoWorld.value)
  .toBeTruthy()
  .then(() => {
    isoWorld.value?.camera.viewport.value?.animate({
      scale: config.INITIAL_ZOOM,
      time: 1500,
      ease(t: number, b: number, c: number, d: number) {
        if ((t /= d / 2) < 1) {
          return (c / 2) * t * t + b;
        } else {
          return (-c / 2) * (--t * (t - 2) - 1) + b;
        }
      }
    });
  });
</script>

<template>
  <IsoWorld
    ref="isoWorld"
    v-if="state"
    :angle="0"
    :width="state.board.columns"
    :height="state.board.rows"
    :tile-size="config.TILE_SIZE"
    @pointerup="
      e => {
        if (e.target !== isoWorld?.camera.viewport.value) return;
        uiStore.unselectUnit();
      }
    "
  >
    <IsoCamera :columns="state.board.columns" :rows="state.board.rows">
      <Board />
    </IsoCamera>

    <Layer :ref="(layer: any) => ui.registerLayer(layer, 'scene')" />
    <Layer :ref="(layer: any) => ui.registerLayer(layer, 'fx')" />
    <Layer :ref="(layer: any) => ui.registerLayer(layer, 'ui')" />
  </IsoWorld>
</template>
