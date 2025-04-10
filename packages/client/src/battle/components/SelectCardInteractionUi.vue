<script setup lang="ts">
import BattleCard from '@/card/components/BattleCard.vue';
import {
  useDispatcher,
  useGameState,
  useTurnPlayer,
  useUserPlayer
} from '../stores/battle.store';
import { useResizeObserver } from '@vueuse/core';
import { throttle } from 'lodash-es';
import FancyButton from '@/ui/components/FancyButton.vue';
import UiModal from '@/ui/components/UiModal.vue';
import { useBattleUiStore } from '../stores/battle-ui.store';
import { INTERACTION_STATES } from '@game/engine/src/game/systems/interaction.system';
import type { CardViewModel } from '@/card/card.model';

const turnPlayer = useTurnPlayer();
const userPlayer = useUserPlayer();
const ui = useBattleUiStore();

const selectedIds = ref<string[]>([]);

const dispatch = useDispatcher();
const commit = () => {
  dispatch({
    type: 'commitCardSelection',
    payload: {
      ids: selectedIds.value,
      playerId: turnPlayer.value.id
    }
  });
  ui.isDestinyResourceActionModalOpened = false;
  selectedIds.value = [];
};

watch(
  () => ui.isDestinyResourceActionModalOpened,
  () => {
    selectedIds.value = [];
  }
);

const { state } = useGameState();
const interactionState = computed(() => {
  return state.value.interactionState;
});

const isOpened = computed(
  () =>
    interactionState.value.state === INTERACTION_STATES.SELECTING_CARDS &&
    userPlayer.value.equals(turnPlayer.value)
);

const choices = computed(() => {
  if (interactionState.value.state !== INTERACTION_STATES.SELECTING_CARDS) {
    return [];
  }

  return interactionState.value.ctx.choices.map(choice => {
    return state.value.entities[choice] as CardViewModel;
  });
});

const minChoices = computed(() => {
  if (interactionState.value.state !== INTERACTION_STATES.SELECTING_CARDS) {
    return 0;
  }

  return interactionState.value.ctx.minChoices;
});

const maxChoices = computed(() => {
  if (interactionState.value.state !== INTERACTION_STATES.SELECTING_CARDS) {
    return 0;
  }

  return interactionState.value.ctx.maxChoices;
});

const cardSpacing = ref(0);
const root = useTemplateRef('root');

const computeMargin = () => {
  if (!root.value) return 0;
  if (!choices.value.length) return 0;

  const allowedWidth = root.value.clientWidth;
  const totalWidth = [...root.value.children].reduce((total, child) => {
    return total + child.clientWidth;
  }, 0);

  const excess = totalWidth - allowedWidth;

  return Math.min(-excess / (choices.value.length - 1), 0);
};

watch(
  [root, computed(() => choices.value.length)],
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
    title="Destiny Resource Action"
    description="Banish up to 3 cards to gain that much Destiny"
    v-model:is-opened="isOpened"
    :style="{
      '--ui-modal-size': 'var(--size-lg)'
    }"
  >
    <div class="destiny-resource-action">
      <h2>
        Select from {{ minChoices }} up to {{ maxChoices }}` cards. ({{
          selectedIds.length
        }}
        / {{ maxChoices }})
      </h2>

      <div class="card-list" ref="root">
        <label v-for="card in choices" :key="card.id">
          <BattleCard :card="card" class="card-miniature" />
          <input
            class="hidden"
            type="checkbox"
            v-model="selectedIds"
            :value="card.id"
            :disabled="
              !selectedIds.includes(card.id) && selectedIds.length >= maxChoices
            "
          />
        </label>
      </div>

      <footer class="flex mt-7 gap-10 justify-center">
        <FancyButton
          text="Banish"
          :disabled="selectedIds.length < minChoices"
          @click="commit"
        />
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
    overflow: clip;
    .card-miniature {
      transform: scale(0.5);
      transform-origin: top left;
      transition: transform 0.2s var(--ease-2);
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
