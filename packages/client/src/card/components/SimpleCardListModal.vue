<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core';
import { throttle } from 'lodash-es';
import UiModal from '@/ui/components/UiModal.vue';
import type { CardViewModel } from '../card.model';
import BattleCard from './BattleCard.vue';

const { cards, title, description } = defineProps<{
  cards: CardViewModel[];
  title: string;
  description: string;
}>();

const isOpened = defineModel<boolean>({ required: true });

const cardSpacing = ref(0);
const root = useTemplateRef('root');

const computeMargin = () => {
  if (!root.value) return 0;
  if (cards.length === 0) return 0;

  const allowedWidth = root.value.clientWidth;
  const totalWidth = [...root.value.children].reduce((total, child) => {
    return total + child.clientWidth;
  }, 0);

  const excess = totalWidth - allowedWidth;

  return Math.min(-excess / (cards.length - 1), 0);
};

watch(
  [root, computed(() => cards.length)],
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
  <UiModal
    :title="title"
    :description="description"
    v-model:is-opened="isOpened"
    :style="{
      '--ui-modal-size': 'var(--size-lg)'
    }"
  >
    <div class="simple-card-list-modal">
      <h2 v-if="description.length">{{ description }}</h2>
      <div
        class="card-list"
        ref="root"
        :style="{ '--card-spacing': cardSpacing }"
      >
        <label v-for="(card, index) in cards" :key="card.id">
          <BattleCard :card="card" />
        </label>
      </div>
      <div v-if="cards.length === 0" class="text-center">
        <p>Card list is empty.</p>
      </div>
    </div>
  </UiModal>
</template>

<style scoped lang="postcss">
h2 {
  text-align: center;
  margin-bottom: var(--size-7);
  font-weight: var(--font-weight-4);
}
.card-list {
  display: flex;
  gap: var(--size-2);
  .hidden {
    opacity: 0;
  }
  > label {
    position: relative;
    transition: transform 0.1s var(--ease-in-2);

    &:hover {
      z-index: 1;
      /* transform: translateY(-10%); */
    }

    &:hover ~ label {
      transform: translateX(var(--size-5));
    }

    &:has(~ label:hover) {
      transform: translateX(calc(-1 * var(--size-5)));
    }

    &:not(:last-child) {
      margin-right: calc(1px * var(--card-spacing));
    }
  }
}
</style>
