<script setup lang="ts">
import { GAME_PHASES } from '@game/engine/src/game/systems/game-phase.system';
import { useGameState } from '../stores/battle.store';
import DeployUi from './DeployUi.vue';

const { state } = useGameState();
</script>

<template>
  <div class="layout">
    <DeployUi v-if="state.phase === GAME_PHASES.DEPLOY" />
  </div>
</template>

<style scoped lang="postcss">
.layout {
  height: 100dvh;
  user-select: none;
}
</style>
