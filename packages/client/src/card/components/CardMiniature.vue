<script setup lang="ts">
import type { CardViewModel } from '../card.model';
import InspectableCard from './InspectableCard.vue';
import {
  HoverCardContent,
  HoverCardRoot,
  HoverCardTrigger,
  HoverCardPortal
} from 'reka-ui';

const { card, side = 'right' } = defineProps<{
  card: CardViewModel;
  side?: 'left' | 'right';
}>();
</script>

<template>
  <HoverCardRoot :open-delay="200" :close-delay="100">
    <HoverCardTrigger>
      <div class="card-miniature">
        <span>{{ card.name }}</span>
        <span>Cost: {{ card.destinyCost }}</span>
      </div>
    </HoverCardTrigger>

    <HoverCardPortal to="#card-portal">
      <HoverCardContent :side="side" :side-offset="20">
        <InspectableCard :card="card" />
      </HoverCardContent>
    </HoverCardPortal>
  </HoverCardRoot>
</template>

<style scoped lang="postcss">
.card-miniature {
  display: flex;
  gap: var(--size-5);
  align-items: center;
  padding: var(--size-5);
  background-color: #32021b;
  border: solid 6px #efef9f;
  border-right-color: #d7ad42;
  border-bottom-color: #d7ad42;
  box-shadow: 3px 3px 0 black;

  cursor: pointer;
  transition: background-color 0.3s var(--ease-2);
}
</style>
