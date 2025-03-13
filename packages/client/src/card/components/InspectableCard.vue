<script setup lang="ts">
import type { CardViewModel } from '../card.model';
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';
import Card from './Card.vue';

const { card } = defineProps<{ card: CardViewModel }>();

const ui = useBattleUiStore();
</script>

<template>
  <Teleport to="#inspected-card" v-if="ui.inspectedCard?.equals(card)" defer>
    <Card
      v-bind="$attrs"
      ref="cardRef"
      :card="{
        id: card.id,
        name: card.name,
        description: card.description,
        image: card.imagePath,
        kind: card.kind,
        manaCost: card.manaCost
      }"
      class="inspected-card"
    />
  </Teleport>
  <Card
    v-else
    ref="cardRef"
    :card="{
      id: card.id,
      name: card.name,
      description: card.description,
      image: card.imagePath,
      kind: card.kind,
      manaCost: card.manaCost
    }"
    @contextmenu.prevent="ui.inspectCard($event.currentTarget, card)"
  />
</template>

<style scoped lang="postcss">
@keyframes inspected-card-spin {
  from {
    transform: rotateY(0deg);
  }
  to {
    transform: rotateY(360deg);
  }
}

.inspected-card {
  /* animation: inspected-card-spin 0.4s var(--ease-3); */
  :has(> &) {
    transform-style: preserve-3d;
    perspective: 800px;
    perspective-origin: center;
  }
}
</style>
