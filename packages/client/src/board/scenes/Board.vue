<script lang="ts" setup>
import BoardCell from '@/board/scenes/BoardCell.vue';
import { providePointLights } from '@/vfx/usePointLight';
import {
  useCells,
  useGameState,
  useUnits,
  useUserPlayer
} from '@/battle/stores/battle.store';
import { useIsoCamera } from '@/iso/composables/useIsoCamera';
import Unit from '@/unit/scenes/Unit.vue';
import { GAME_PHASES } from '@game/engine/src/game/systems/game-phase.system';

const cells = useCells();
const units = useUnits();
const readyCells = ref(0);
const camera = useIsoCamera();
const { state } = useGameState();
providePointLights(camera);
const player = useUserPlayer();

const displayedUnits = computed(() =>
  state.value.phase === GAME_PHASES.DEPLOY
    ? units.value.filter(unit => unit.playerId === player.value.id)
    : units.value
);
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
      <Unit v-for="unit in displayedUnits" :key="unit.id" :unit="unit" />
    </template>
    <!-- <AmbientLight :world-size="worldSize" /> -->
  </template>
</template>
