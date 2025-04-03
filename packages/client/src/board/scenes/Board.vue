<script lang="ts" setup>
import BoardCell from '@/board/scenes/BoardCell.vue';
import { providePointLights } from '@/vfx/usePointLight';
import { useCells, useUnits } from '@/battle/stores/battle.store';
import { useIsoCamera } from '@/iso/composables/useIsoCamera';
import Unit from '@/unit/scenes/Unit.vue';

const cells = useCells();
const units = useUnits();
const readyCells = ref(0);
const camera = useIsoCamera();
providePointLights(camera);
</script>

<template>
  <template v-if="camera.viewport.value">
    <BoardCell
      v-for="cell in cells"
      :key="cell.id"
      :cell
      @ready="readyCells++"
    />

    <template v-if="readyCells === cells.length">
      <Unit v-for="unit in units" :key="unit.id" :unit="unit" />
    </template>
    <!-- <AmbientLight :world-size="worldSize" /> -->
  </template>
</template>
