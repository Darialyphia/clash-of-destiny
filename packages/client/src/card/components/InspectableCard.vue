<script setup lang="ts">
import type { CardViewModel } from '../card.model';
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';
import Card from './Card.vue';

const { card } = defineProps<{ card: CardViewModel }>();

const ui = useBattleUiStore();

const cardProps = computed(() => ({
  id: card.id,
  name: card.name,
  description: card.description,
  image: card.imagePath,
  kind: card.kind,
  manaCost: card.manaCost,
  exp: card.exp,
  rarity: card.rarity,
  allowedJobs: card.allowedJobs
}));
</script>

<template>
  <Teleport to="#inspected-card" v-if="ui.inspectedCard?.equals(card)" defer>
    <Card
      v-bind="$attrs"
      ref="cardRef"
      :card="cardProps"
      class="inspected-card"
    />
  </Teleport>
  <Card
    v-else
    ref="cardRef"
    :card="cardProps"
    @contextmenu.prevent="ui.inspectCard($event.currentTarget, card)"
  />
</template>

<style scoped lang="postcss">
@keyframes card-front-spin {
  from {
    transform: rotateY(180deg);
  }
  to {
    transform: rotateY(0deg) scale(1.5);
  }
}

@keyframes card-back-spin {
  from {
    transform: rotateY(360deg);
  }
  to {
    transform: rotateY(180deg) sale(1.5);
  }
}

.inspected-card {
  --pixel-scale: 2;
  :has(> &) {
    transform-style: preserve-3d;
    perspective: 800px;
    perspective-origin: center;
  }
}
:global(.inspected-card > .card-front) {
  animation: card-front-spin 0.4s var(--ease-3) forwards;
}
:global(.inspected-card > .card-back) {
  animation: card-back-spin 0.4s var(--ease-3) forwards;
}
</style>
