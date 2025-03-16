<script setup lang="ts">
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';
import Card from './Card.vue';

const ui = useBattleUiStore();
</script>

<template>
  <div class="play-intent">
    <Card
      v-if="ui.cardPlayIntent"
      class="play-intent-card"
      :card="{
        id: ui.cardPlayIntent.id,
        name: ui.cardPlayIntent.name,
        description: ui.cardPlayIntent.description,
        image: ui.cardPlayIntent.imagePath,
        kind: ui.cardPlayIntent.kind,
        manaCost: ui.cardPlayIntent.manaCost,
        exp: ui.cardPlayIntent.exp,
        rarity: ui.cardPlayIntent.rarity,
        allowedJobs: ui.cardPlayIntent.allowedJobs
      }"
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
