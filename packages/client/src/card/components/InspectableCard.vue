<script setup lang="ts">
import type { CardViewModel } from '../card.model';
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';
import Card from './Card.vue';
import BattleCard from './BattleCard.vue';

const { card } = defineProps<{ card: CardViewModel }>();

const ui = useBattleUiStore();
</script>

<template>
  <Teleport to="#inspected-card" v-if="ui.inspectedCard?.equals(card)" defer>
    <BattleCard
      :card="card"
      v-bind="$attrs"
      ref="cardRef"
      class="inspected-card"
    />
  </Teleport>
  <BattleCard
    v-else
    ref="cardRef"
    :card="card"
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
