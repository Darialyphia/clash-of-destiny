<script setup lang="ts">
import UiModal from '@/ui/components/UiModal.vue';
import {
  useDispatcher,
  useGameState,
  useTurnPlayer
} from '../stores/battle.store';
import { GAME_PHASES } from '@game/engine/src/game/game.enums';
import { VisuallyHidden } from 'reka-ui';
import FancyButton from '@/ui/components/FancyButton.vue';
import { isDefined } from '@game/shared';
import { useBattleUiStore } from '../stores/battle-ui.store';
import { useResizeObserver } from '@vueuse/core';
import { throttle } from 'lodash-es';
import BattleCard from '@/card/components/BattleCard.vue';

const { state } = useGameState();
const player = useTurnPlayer();
const ui = useBattleUiStore();

const deck = computed(() => {
  return player.value.getDestinyDeck();
});

const isOpened = ref(false);

watch(
  () => state.value.phase,
  phase => {
    isOpened.value = phase === GAME_PHASES.DESTINY;
  },
  { immediate: true }
);

const selectedCardIndex = ref<number | null>(null);
const dispatch = useDispatcher();

const skip = () => {
  dispatch({
    type: 'skipDestiny',
    payload: {
      playerId: player.value.id
    }
  });
};

const play = () => {
  if (!isDefined(selectedCardIndex.value)) return;

  dispatch({
    type: 'playDestinyCard',
    payload: {
      playerId: player.value.id,
      index: selectedCardIndex.value
    }
  });

  isOpened.value = false;
  ui.cardPlayIntent = deck.value[selectedCardIndex.value];
  selectedCardIndex.value = null;
};

const cardSpacing = ref(0);
const root = useTemplateRef('root');

const computeMargin = () => {
  if (!root.value) return 0;
  if (!deck.value.length) return 0;

  const allowedWidth = root.value.clientWidth;
  const totalWidth = [...root.value.children].reduce((total, child) => {
    return total + child.clientWidth;
  }, 0);

  const excess = totalWidth - allowedWidth;

  return Math.min(-excess / (deck.value.length - 1), 0);
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
</script>

<template>
  <UiModal
    v-model:is-opened="isOpened"
    title="Destiny Phase"
    description="You may choose to play one Destiny card"
    :closable="false"
    :style="{
      '--ui-modal-size': 'var(--size-lg)'
    }"
  >
    <h2>You may choose to play one Destiny card</h2>

    <div
      class="card-list"
      :class="{ hidden: deck.length === 0 }"
      ref="root"
      :style="{ '--card-spacing': cardSpacing }"
    >
      <label v-for="(card, index) in deck" :key="card.id">
        <BattleCard :card="card" />
        <VisuallyHidden>
          <input
            type="radio"
            name="destiny-card"
            :value="index"
            v-model="selectedCardIndex"
            :disabled="card.destinyCost! > player.destiny"
          />
        </VisuallyHidden>
      </label>
    </div>

    <footer class="flex mt-7 gap-10 justify-center">
      <FancyButton text="Skip" variant="error" @click="skip" />
      <FancyButton
        text="Play"
        @click="play"
        :disabled="selectedCardIndex === null"
      />
    </footer>
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
      transform: translateY(-10%);
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

    &:has(input:checked) {
      filter: drop-shadow(0 0 0.5rem yellow);
    }

    &:has(input:disabled) {
      filter: grayscale(1);
    }
  }
}
</style>
