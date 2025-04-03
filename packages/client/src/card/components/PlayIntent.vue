<script setup lang="ts">
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';
import BattleCard from './BattleCard.vue';

const ui = useBattleUiStore();
</script>

<template>
  <div class="play-intent">
    <BattleCard
      v-if="ui.cardPlayIntent"
      class="play-intent-card"
      :card="ui.cardPlayIntent"
    />
  </div>
</template>

<style scoped lang="postcss">
.play-intent {
  position: fixed;
  top: 25%;
  right: var(--size-3);
}

.play-intent-card {
  --pixel-scale: 2;
  :has(> &) {
    transform-style: preserve-3d;
    perspective: 800px;
    perspective-origin: center;
  }
}
:global(.play-intent-card > .card-front) {
  animation: card-front-spin 0.4s var(--ease-3) forwards;
}
:global(.play-intent-card > .card-back) {
  animation: card-back-spin 0.4s var(--ease-3) forwards;
}
</style>
