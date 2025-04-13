<script setup lang="ts">
import DestinyResourceActionUi from '@/battle/components/DestinyResourceActionUi.vue';
import ReplaceResourceActionUi from '@/battle/components/ReplaceResourceActionUi.vue';
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
    <template v-if="ui.selectedUnit">
      <FancyButton
        v-for="ability in ui.selectedUnit.abilities"
        class="pointer-events-auto w-full ability"
        :text="ability.label"
        :disabled="!ability.canUse"
        variant="info"
        @click="
          () => {
            ui.selectedUnit?.useAbility(ability.id);
          }
        "
      />
    </template>
    <!-- <transition>
      <FancyButton
        :disabled="!player.canPerformResourceAction"
        class="pointer-events-auto w-full"
        text="Draw"
        @click="player.drawResourceAction()"
      />
    </transition> -->

    <!-- <transition>
      <FancyButton
        :disabled="!player.canPerformResourceAction"
        class="pointer-events-auto w-full"
        text="Replace"
        @click="ui.isReplaceResourceActionModalOpened = true"
      />
    </transition> -->

    <transition>
      <FancyButton
        :disabled="!player.canPerformResourceAction"
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
    <ReplaceResourceActionUi />
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

.ability {
  grid-column: span 2;
}
</style>
