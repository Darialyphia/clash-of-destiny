<script setup lang="ts">
import UiButton from '@/ui/components/UiButton.vue';
import {
  useBattleEvent,
  useBattleStore,
  useGameState,
  useUserPlayer
} from '../stores/battle.store';
import { INTERACTION_STATES } from '@game/engine/src/game/systems/interaction.system';
import { useBattleUiStore } from '../stores/battle-ui.store';
import { GAME_EVENTS } from '@game/engine/src/game/game.events';
import FancyButton from '@/ui/components/FancyButton.vue';

const { state } = useGameState();
const ui = useBattleUiStore();

const isQuickCasting = ref(false);
useBattleEvent(GAME_EVENTS.INPUT_START, async e => {
  if (e.type === 'playCard' && ui.firstTargetIntent) {
    isQuickCasting.value = true;
  }
});
const forceHide = ref(false);
useBattleEvent(GAME_EVENTS.PLAYER_BEFORE_PLAY_CARD, async e => {
  isQuickCasting.value = false;
  forceHide.value = true;
});
useBattleEvent(GAME_EVENTS.PLAYER_AFTER_PLAY_CARD, async e => {
  forceHide.value = false;
});

const isDisplayed = computed(() => {
  if (forceHide.value) {
    return false;
  }
  if (
    state.value.interactionState.state !== INTERACTION_STATES.SELECTING_TARGETS
  ) {
    return false;
  }
  if (!ui.cardPlayIntent) {
    return true;
  }
  if (isQuickCasting.value) {
    return (
      ui.cardPlayIntent.maxTargets - 1 >
      state.value.interactionState.ctx.selectedTargets.length
    );
  } else {
    return (
      ui.cardPlayIntent.maxTargets >
      state.value.interactionState.ctx.selectedTargets.length
    );
  }
});

const battle = useBattleStore();
const player = useUserPlayer();

const canSkip = computed(() => {
  return (
    state.value.interactionState.state ===
      INTERACTION_STATES.SELECTING_TARGETS &&
    state.value.interactionState.ctx.canSkip
  );
});
</script>

<template>
  <div v-if="isDisplayed" class="targeting-ui" @click.stop>
    <FancyButton
      variant="error"
      text="Cancel"
      @click="
        battle.dispatch({
          type: 'cancelPlayCard',
          payload: { playerId: player.id }
        })
      "
    />

    <FancyButton
      v-if="canSkip"
      text="Skip"
      @click="
        battle.dispatch({
          type: 'commitPlayCard',
          payload: {
            playerId: player.id
          }
        })
      "
    />
  </div>
</template>

<style scoped lang="postcss">
.targeting-ui {
  pointer-events: auto;
  position: absolute;
  bottom: calc(var(--size-13));
  left: 50%;
  transform: translateX(-50%);

  display: flex;
  gap: 0;
  align-items: center;

  @screen lt-lg {
    bottom: var(--size-8);
  }
}

button {
  --ui-button-size: var(--font-size-3);

  box-shadow: 0 5px 0.25rem hsl(var(--gray-11-hsl) / 0.6);
}
</style>
