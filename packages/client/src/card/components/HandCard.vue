<script setup lang="ts">
import { Teleport } from 'vue';
import Card from './Card.vue';
import { usePageLeave } from '@vueuse/core';
import type { CardViewModel } from '../card.model';
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';
import InspectableCard from './InspectableCard.vue';

const { card } = defineProps<{ card: CardViewModel }>();

const isOutOfScreen = usePageLeave();

const ui = useBattleUiStore();

const isClicking = ref(false);
const clickedPosition = ref({ x: 0, y: 0 });

const isSelected = computed(() => ui.selectedCard?.equals(card));
const SELECTION_THRESHOLD = 15;

const startDragging = () => {
  const stopDragging = () => {
    ui.unselectCard();

    document.body.removeEventListener('mouseup', onMouseup);
  };
  const onMouseup = () => {
    stopDragging();
  };

  document.body.addEventListener('mouseup', onMouseup);
  const unwatch = watchEffect(() => {
    if (isOutOfScreen.value) {
      stopDragging();
      ui.unselectCard();
      unwatch();
    }
  });
};

const onMouseDown = (e: MouseEvent) => {
  if (e.button !== 0) return;

  isClicking.value = true;
  clickedPosition.value = { x: e.clientX, y: e.clientY };

  const target = e.currentTarget as HTMLElement;
  const cardElement = target.querySelector('.card') as HTMLElement;

  const onMousemove = (e: MouseEvent) => {
    if (!isClicking.value) return;

    if (Math.abs(e.clientY - clickedPosition.value.y) > SELECTION_THRESHOLD) {
      ui.selectCard(cardElement, card);
      document.body.removeEventListener('mousemove', onMousemove);
    }
    startDragging();
  };
  document.body.addEventListener('mousemove', onMousemove);
  const onMouseup = () => {
    isClicking.value = false;
    document.body.removeEventListener('mousemove', onMousemove);
    document.body.removeEventListener('mouseup', onMouseup);
  };
  document.body.addEventListener('mouseup', onMouseup);
};
</script>

<template>
  <div
    class="hand-card"
    :class="{
      hoverable: !ui.selectedCard
    }"
    @mousedown="onMouseDown"
  >
    <component :is="isSelected ? Teleport : 'div'" to="#dragged-card">
      <InspectableCard
        :card="card"
        class="hand-card__card"
        :class="{
          'is-dragging': isSelected
        }"
      />
    </component>
  </div>
</template>

<style scoped lang="postcss">
.hand-card {
  position: relative;
  transform-origin: bottom right;
  transform-style: preserve-3d;
  perspective: 800px;
  perspective-origin: center;
  aspect-ratio: var(--aspect-card);

  &.hoverable&:hover {
    &.is-shaking {
      animation: var(--animation-shake-x);
      animation-duration: 0.3s;
    }
  }
}
</style>
