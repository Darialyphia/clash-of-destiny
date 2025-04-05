<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core';
import { throttle } from 'lodash-es';
import HandCard from './HandCard.vue';
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';
import type { PlayerViewModel } from '@/player/player.model';

const { player } = defineProps<{
  player: PlayerViewModel;
}>();

const hand = computed(() => player.getHand());
const ui = useBattleUiStore();
const cardSpacing = ref(0);
const root = useTemplateRef('root');

const computeMargin = () => {
  if (!root.value) return 0;
  if (!player.handSize) return 0;

  const allowedWidth = root.value.clientWidth;
  const totalWidth = [...root.value.children].reduce((total, child) => {
    return total + child.clientWidth;
  }, 0);

  const excess = totalWidth - allowedWidth;

  return Math.min(-excess / (player.handSize - 1), 0);
};

watch(
  [root, computed(() => player.handSize)],
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
    <div
      class="hand"
      ref="root"
      :key="player.id"
      :class="{ hidden: ui.isDestinyResourceActionModalOpened }"
    >
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
  &.hidden {
    opacity: 0;
  }
  > div {
    pointer-events: auto;
    transform: translateY(50%);
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
