<script setup lang="ts">
import BattleCard from '@/card/components/BattleCard.vue';
import { useDispatcher, useTurnPlayer } from '../stores/battle.store';
import { useResizeObserver } from '@vueuse/core';
import { throttle } from 'lodash-es';
import {
  HoverCardContent,
  HoverCardRoot,
  HoverCardTrigger,
  HoverCardPortal,
  VisuallyHidden
} from 'reka-ui';
import FancyButton from '@/ui/components/FancyButton.vue';
import UiModal from '@/ui/components/UiModal.vue';
import { useBattleUiStore } from '../stores/battle-ui.store';

const player = useTurnPlayer();
const ui = useBattleUiStore();

const cardSpacing = ref(0);
const root = useTemplateRef('root');

const computeMargin = () => {
  if (!root.value) return 0;
  if (!player.value.handSize) return 0;

  const allowedWidth = root.value.clientWidth;
  const totalWidth = [...root.value.children].reduce((total, child) => {
    return total + child.clientWidth;
  }, 0);

  const excess = totalWidth - allowedWidth;

  return Math.min(-excess / (player.value.handSize - 1), 0);
};

watch(
  [root, computed(() => player.value.handSize)],
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

const selectedIndices = ref<number[]>([]);

const dispatch = useDispatcher();
const banish = () => {
  dispatch({
    type: 'resourceActionGainDestiny',
    payload: {
      indices: selectedIndices.value,
      playerId: player.value.id
    }
  });
  ui.isDestinyResourceActionModalOpened = false;
  selectedIndices.value = [];
};

watch(
  () => ui.isDestinyResourceActionModalOpened,
  () => {
    selectedIndices.value = [];
  }
);
</script>

<template>
  <UiModal
    title="Destiny Resource Action"
    description="Banish up to 3 cards to gain that much Destiny"
    v-model:is-opened="ui.isDestinyResourceActionModalOpened"
    :style="{
      '--ui-modal-size': 'var(--size-lg)'
    }"
  >
    <div class="destiny-resource-action">
      <h2>Select up to 3 cards to banish to gain this much Destiny.</h2>

      <div
        class="card-list"
        ref="root"
        :class="{ hidden: !ui.isDestinyResourceActionModalOpened }"
      >
        <label v-for="(card, index) in player.getHand()" :key="card.id">
          <HoverCardRoot :open-delay="300" :close-delay="0">
            <HoverCardTrigger>
              <BattleCard :card="card" class="card-miniature" />
            </HoverCardTrigger>

            <HoverCardPortal to="#card-portal">
              <HoverCardContent side="right" :side-offset="20">
                <BattleCard :card="card" class="hover-card" />
              </HoverCardContent>
            </HoverCardPortal>
          </HoverCardRoot>
          <VisuallyHidden>
            <input
              type="checkbox"
              v-model="selectedIndices"
              :value="index"
              :disabled="
                !selectedIndices.includes(index) && selectedIndices.length >= 3
              "
            />
          </VisuallyHidden>
        </label>
      </div>

      <footer class="flex mt-7 gap-10 justify-center">
        <FancyButton
          text="Cancel"
          variant="error"
          @click="ui.isDestinyResourceActionModalOpened = false"
        />
        <FancyButton text="Banish" @click="banish" />
      </footer>
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
  gap: var(--size-5);
  flex-wrap: wrap;
  overflow: auto;
  .hidden {
    opacity: 0;
  }
  > label {
    position: relative;
    width: var(--card-width);
    height: var(--card-height);
    overflow: hidden;
    .card-miniature {
      transform: scale(0.5);
      transform-origin: top left;
      transition: transform 0.2s var(--ease-2);
      &:hover {
        transform: scale(0.5) translateY(1rem);
      }
    }

    &:has(input:checked) {
      filter: drop-shadow(0 0 0.5rem yellow);
    }

    &:has(input:disabled) {
      filter: grayscale(1);
    }
  }
}
</style>
