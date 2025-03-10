<script lang="ts" setup>
import { config } from '@/utils/config';
import IsoWorld from '@/iso/components/IsoWorld.vue';
import IsoCamera from '@/iso/components/IsoCamera.vue';
import { useKeyboardControl } from '@/shared/composables/useKeyboardControl';
import { useSettingsStore } from '@/shared/composables/useSettings';
import { until } from '@vueuse/core';
import { useBattleStore, useGameState } from '../stores/battle.store';
import { useBattleUiStore } from '../stores/battle-ui.store';

const battleStore = useBattleStore();
const settingsStore = useSettingsStore();
const uiStore = useBattleUiStore();
const { state } = useGameState();
const isoWorld = useTemplateRef('isoWorld');

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
    <IsoCamera
      :columns="state.board.columns"
      :rows="state.board.rows"
      v-slot="{ worldSize }"
    >
      <Board :world-size="worldSize" />
    </IsoCamera>

    <Layer :ref="(layer: any) => ui.registerLayer(layer, 'scene')" />
    <Layer :ref="(layer: any) => ui.registerLayer(layer, 'fx')" />
    <Layer :ref="(layer: any) => ui.registerLayer(layer, 'ui')" />
  </IsoWorld>
</template>
