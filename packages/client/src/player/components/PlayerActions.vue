<script setup lang="ts">
import DestinyResourceActionUi from '@/battle/components/DestinyResourceActionUi.vue';
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';
import { useTurnPlayer, useUserPlayer } from '@/battle/stores/battle.store';
import FancyButton from '@/ui/components/FancyButton.vue';

const ui = useBattleUiStore();
const turnPlayer = useTurnPlayer();
const player = useUserPlayer();

const isTurnPlayer = computed(() => {
  return turnPlayer.value.equals(player.value);
});
</script>

<template>
  <div class="player-actions" :class="{ 'is-hidden': !isTurnPlayer }">
    <transition>
      <FancyButton
        v-if="player.canPerformResourceAction"
        class="pointer-events-auto w-full"
        text="Draw"
        @click="player.drawResourceAction()"
      />
    </transition>

    <transition>
      <FancyButton
        v-if="player.canPerformResourceAction"
        class="pointer-events-auto w-full"
        text="Replace"
      />
    </transition>

    <transition>
      <FancyButton
        v-if="player.canPerformResourceAction"
        class="pointer-events-auto w-full"
        text="Destiny"
        @click="ui.isDestinyResourceActionModalOpened = true"
      />
    </transition>

    <transition>
      <FancyButton
        class="pointer-events-auto w-full"
        text="End Turn"
        variant="error"
        @click="
          () => {
            ui.unselectUnit();
            player.endTurn();
          }
        "
      />
    </transition>

    <DestinyResourceActionUi />
  </div>
</template>

<style scoped lang="postcss">
.is-hidden {
  visibility: hidden;
}

.player-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.v-enter-active,
.v-leave-active {
  transition:
    opacity 0.2s,
    transform 0.3s;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateY(5px) scale(0.95);
}
</style>
