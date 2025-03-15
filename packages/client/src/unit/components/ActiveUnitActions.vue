<script setup lang="ts">
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';
import { useActiveUnit, useUserPlayer } from '@/battle/stores/battle.store';
import FancyButton from '@/ui/components/FancyButton.vue';

const activeUnit = useActiveUnit();
const ui = useBattleUiStore();
const player = useUserPlayer();
const isActiveUnitOwner = computed(() =>
  activeUnit.value.getPlayer().equals(player.value)
);
</script>

<template>
  <div
    class="flex flex-col gap-3 justify-end"
    :class="{ 'is-hidden': !isActiveUnitOwner }"
  >
    <transition>
      <FancyButton
        v-if="activeUnit.moveIntent"
        class="pointer-events-auto w-full"
        text="Move"
        @click="activeUnit.commitMove()"
      />
    </transition>

    <transition>
      <FancyButton
        v-if="
          ui.selectedUnit && activeUnit.canAttackAt(ui.selectedUnit.getCell())
        "
        class="pointer-events-auto w-full"
        text="Attack"
        @click="activeUnit.attackAt(ui.selectedUnit.getCell())"
      />
    </transition>

    <transition>
      <FancyButton
        class="pointer-events-auto w-full"
        text="End Turn"
        @click="activeUnit.endTurn()"
      />
    </transition>

    <transition>
      <FancyButton
        v-if="activeUnit.canLevelUp"
        class="pointer-events-auto w-full"
        text="Level Up"
        @click="activeUnit.levelUp()"
      />
    </transition>
  </div>
</template>

<style scoped lang="postcss">
.is-hidden {
  visibility: hidden;
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
