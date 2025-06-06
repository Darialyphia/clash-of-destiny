<script setup lang="ts">
import { Teleport } from 'vue';
import { usePageLeave } from '@vueuse/core';
import type { CardViewModel } from '../card.model';
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';
import InspectableCard from './InspectableCard.vue';
import {
  TooltipRoot,
  TooltipTrigger,
  TooltipPortal,
  TooltipContent
} from 'reka-ui';
import { isDefined } from '@game/shared';
import { useDispatcher } from '@/battle/stores/battle.store';

const { card } = defineProps<{ card: CardViewModel }>();

const isOutOfScreen = usePageLeave();

const ui = useBattleUiStore();

const isClicking = ref(false);
const clickedPosition = ref({ x: 0, y: 0 });

const isSelected = computed(() => ui.selectedCard?.equals(card));
const SELECTION_THRESHOLD = 10;
const dispatch = useDispatcher();
const startDragging = () => {
  const stopDragging = () => {
    document.body.removeEventListener('mouseup', onMouseup);
  };
  const onMouseup = () => {
    if (!ui.selectedCard?.canPlay || !ui.hoveredCell) {
      ui.unselectCard();

      return;
    }
    ui.cardPlayIntent = ui.selectedCard;
    // ui.selectedCard?.play();
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
  if (!card.canPlay) return;

  isClicking.value = true;
  clickedPosition.value = { x: e.clientX, y: e.clientY };

  const target = e.currentTarget as HTMLElement;
  const cardElement = target.querySelector('.card') as HTMLElement;
  const onMousemove = (e: MouseEvent) => {
    if (!isClicking.value) return;

    if (Math.abs(e.clientY - clickedPosition.value.y) > SELECTION_THRESHOLD) {
      ui.selectCard(cardElement, card);
      ui.selectedCard?.play();
      document.body.removeEventListener('mousemove', onMousemove);
    }
  };
  startDragging();
  document.body.addEventListener('mousemove', onMousemove);

  const onMouseup = () => {
    isClicking.value = false;
    document.body.removeEventListener('mousemove', onMousemove);
    document.body.removeEventListener('mouseup', onMouseup);
  };
  document.body.addEventListener('mouseup', onMouseup);
};

const modifiers = computed(() =>
  card.getModifiers().filter(modifier => isDefined(modifier) && modifier.name)
);
</script>

<template>
  <div
    class="hand-card"
    :class="{
      hoverable: !ui.selectedCard,
      disabled: !card.canPlay
    }"
    @mousedown="onMouseDown"
    @mouseup="
      e => {
        if (e.button !== 0) return;
        if (!card.canPlay) return;
        ui.cardPlayIntent = card;
        card.play();
      }
    "
  >
    <component :is="isSelected ? Teleport : 'div'" to="#dragged-card">
      <TooltipRoot :delay-duration="500">
        <TooltipTrigger>
          <InspectableCard
            :card="card"
            class="hand-card__card"
            :class="{
              'is-dragging': isSelected
            }"
          />
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent :side-offset="40">
            <div class="flex flex-col gap-2 max-w-14">
              <div
                class="bg-black text-white p-2 rounded"
                v-for="modifier in modifiers"
                :key="modifier.id"
              >
                <div class="font-bold">
                  {{ modifier.name }}
                </div>
                {{ modifier.description }}
              </div>
            </div>
          </TooltipContent>
        </TooltipPortal>
      </TooltipRoot>
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
  --pixel-scale: 2;
  width: calc(126px * var(--pixel-scale));
  transition: width 0.2s ease;
  cursor: url('/assets/ui/cursor-hover.png'), auto;

  &.disabled {
    cursor: url('/assets/ui/cursor-disabled.png'), auto;
    filter: brightness(0.65);
  }

  &:not(:has(.hand-card__card)) {
    width: 0;
  }
  &.hoverable&:hover {
    &.is-shaking {
      animation: var(--animation-shake-x);
      animation-duration: 0.3s;
    }
  }
}
</style>
