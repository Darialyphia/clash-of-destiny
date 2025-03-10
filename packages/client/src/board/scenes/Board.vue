<script lang="ts" setup>
import BoardCell from '@/board/scenes/BoardCell.vue';
import { providePointLights } from '@/vfx/usePointLight';
import { useGameState } from '@/battle/stores/battle.store';
import { useIsoCamera } from '@/iso/composables/useIsoCamera';
import Unit from '@/unit/scenes/Unit.vue';

const { state } = useGameState();
const readyCells = ref(0);
const camera = useIsoCamera();
providePointLights(camera);
</script>

<template>
  <template v-if="camera.viewport.value">
    <BoardCell
      v-for="cell in state.board.cells"
      :key="cell.id"
      :cell
      @ready="readyCells++"
    />

    <Unit v-for="unit in state.units" :key="unit.id" :unit="unit" />

    <!-- <AmbientLight :world-size="worldSize" /> -->
  </template>
</template>
