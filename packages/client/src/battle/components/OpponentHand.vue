<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core';
import { throttle } from 'lodash-es';
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

const handSize = computed(() => {
  return player.handSize;
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
  [root, handSize],
  async () => {
    await nextTick();
    cardSpacing.value = computeMargin();
    console.log(cardSpacing.value);
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
      :class="{
        hidden:
          ui.isDestinyResourceActionModalOpened ||
          ui.isReplaceResourceActionModalOpened
      }"
      :inert="
        state.interactionState.state === INTERACTION_STATES.SELECTING_TARGETS
      "
    >
      <div v-for="i in handSize" :key="i" class="card" />
    </div>
  </transition>
</template>

<style scoped lang="postcss">
.hand {
  display: flex;
  &.hidden {
    opacity: 0;
  }
  justify-self: center;
}

.card {
  --pixel-scale: 1;
  width: calc(var(--card-width) * var(--pixel-scale));
  height: calc(var(--card-height) * var(--pixel-scale));
  background: url('/assets/ui/card-back4.png');
  background-size: cover;
  pointer-events: auto;
  transform: translateY(-50%) rotate(0.5turn);
  box-shadow: -10px 0 0.5rem hsl(0 0 0 / 0.2);

  &:not(:last-child) {
    margin-right: calc(1px * v-bind(cardSpacing));
  }
}
</style>
