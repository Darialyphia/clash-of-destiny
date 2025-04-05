<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core';
import { throttle } from 'lodash-es';
import HandCard from './HandCard.vue';
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';
import type { PlayerViewModel } from '@/player/player.model';
import { useBattleEvent, useGameState } from '@/battle/stores/battle.store';
import { INTERACTION_STATES } from '@game/engine/src/game/systems/interaction.system';
import type { Nullable } from '@game/shared';
import { GAME_EVENTS } from '@game/engine/src/game/game.events';

const { player } = defineProps<{
  player: PlayerViewModel;
}>();

const playedCardId = ref<Nullable<string>>();
useBattleEvent(GAME_EVENTS.PLAYER_BEFORE_PLAY_CARD, async event => {
  playedCardId.value = event.card.id;
});

const hand = computed(() => {
  return player
    .getHand()
    .filter(
      card => !ui.cardPlayIntent?.equals(card) && card.id !== playedCardId.value
    );
});
const ui = useBattleUiStore();
const cardSpacing = ref(0);
const root = useTemplateRef('root');
const { state } = useGameState();

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
      :inert="
        state.interactionState.state === INTERACTION_STATES.SELECTING_TARGETS
      "
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
