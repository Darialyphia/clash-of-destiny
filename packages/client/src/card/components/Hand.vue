<script setup lang="ts">
import type { UnitViewModel } from '@/unit/unit.model';
import { useResizeObserver } from '@vueuse/core';
import { throttle } from 'lodash-es';
import HandCard from './HandCard.vue';
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';

const { unit } = defineProps<{
  unit: UnitViewModel;
}>();

const hand = computed(() => unit.getHand());
const ui = useBattleUiStore();
const cardSpacing = ref(0);
const root = useTemplateRef('root');

const computeMargin = () => {
  if (!root.value) return 0;
  if (!unit.handSize) return 0;

  const allowedWidth = root.value.clientWidth;
  const totalWidth = [...root.value.children].reduce((total, child) => {
    return total + child.clientWidth;
  }, 0);

  const excess = totalWidth - allowedWidth;

  return Math.min(-excess / (unit.handSize - 1), 0);
};

watch(
  [root, computed(() => unit.handSize)],
  async () => {
    await nextTick();
    cardSpacing.value = computeMargin();
  },
  { immediate: true }
);

useResizeObserver(
  root,
  throttle(() => {
    cardSpacing.value = computeMargin();
  }, 50)
);
</script>

<template>
  <transition appear mode="out-in">
    <div class="hand" ref="root" :key="unit.id">
      <div
        v-for="(card, index) in hand"
        :key="card.id"
        :style="{ '--i': index }"
        :data-flip-id="card.id"
      >
        <div>
          <HandCard :card="card" />
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped lang="postcss">
.hand {
  display: flex;
  > div {
    pointer-events: auto;
    transform: translateY(35%);
    transition: transform 0.35s var(--ease-spring-2);
    transition-delay: calc(var(--i) * 0.03s);
    box-shadow: -10px 0 0.5rem hsl(0 0 0 / 0.2);

    &:not(:last-child) {
      margin-right: calc(1px * v-bind(cardSpacing));
    }

    &:hover {
      --i: 0 !important;
      z-index: 1;
      > div {
        transform: translateY(-20px);
        transition: inherit;
      }
    }

    :has(&:hover) > div {
      transform: translateY(0);
    }
  }

  &.v-enter-active,
  &.v-leave-active {
    transition: transform 0.35s var(--ease-spring-2);
  }

  &.v-enter-from,
  &.v-leave-to {
    transform: translateY(50%);
  }
}
</style>
