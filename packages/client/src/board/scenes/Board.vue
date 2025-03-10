<script lang="ts" setup>
import BoardCell from '@/board/scenes/BoardCell.vue';
import { providePointLights } from '@/vfx/usePointLight';
import { useGameState } from '@/battle/stores/battle.store';
import { useIsoCamera } from '@/iso/composables/useIsoCamera';

const { state } = useGameState();
const readyCells = ref(0);
const camera = useIsoCamera();
providePointLights(camera);
</script>

<template>
  <BoardCell
    v-for="cell in state.board.cells"
    :key="cell.id"
    :cell
    @ready="readyCells++"
  />

  <!-- <template v-if="ui.isBoardAppearAnimationDone">
    <Unit v-for="unit in battleStore.state.units" :key="unit.id" :unit="unit" />
  </template> -->

  <!-- <AmbientLight :world-size="worldSize" /> -->
</template>
