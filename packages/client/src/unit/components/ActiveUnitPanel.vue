<script setup lang="ts">
import UnitPanel from './UnitPanel.vue';
import { useActiveUnit, useUserPlayer } from '@/battle/stores/battle.store';
import UiButton from '@/ui/components/UiButton.vue';

const activeUnit = useActiveUnit();

const player = useUserPlayer();
const isActiveUnitOwner = computed(() =>
  activeUnit.value.getPlayer().equals(player.value)
);
</script>

<template>
  <div class="wrapper" v-if="isActiveUnitOwner" :key="activeUnit.id">
    <div
      class="flex flex-col gap-3 justify-end"
      :class="{ hidden: isActiveUnitOwner }"
    >
      <UiButton
        v-if="activeUnit.moveIntent"
        class="primary-button pointer-events-auto"
        @click="activeUnit.commitMove()"
      >
        Move
      </UiButton>
      <UiButton
        class="primary-button pointer-events-auto"
        @click="activeUnit.endTurn()"
      >
        End turn
      </UiButton>
      <UiButton
        v-if="activeUnit.canLevelUp"
        class="primary-button pointer-events-auto"
        @click="activeUnit.levelUp()"
      >
        Level Up
      </UiButton>
    </div>

    <UnitPanel :unit="activeUnit" />
  </div>
</template>

<style scoped lang="postcss">
.wrapper {
  display: flex;
  gap: var(--size-4);
  padding: var(--size-5);
}
</style>
