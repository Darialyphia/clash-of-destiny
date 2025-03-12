<script setup lang="ts">
import { useActiveUnit, useUserPlayer } from '@/battle/stores/battle.store';
import UiButton from '@/ui/components/UiButton.vue';

const activeUnit = useActiveUnit();

const player = useUserPlayer();
const isActiveUnitOwner = computed(() =>
  activeUnit.value.getPlayer().equals(player.value)
);
</script>

<template>
  <div class="flex flex-col gap-4" v-if="isActiveUnitOwner">
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
      EndTurn
    </UiButton>
    <div class="fancy-surface active-unit-panel">
      <div>
        <div class="name">{{ activeUnit.name }}</div>
        <div>HP: {{ activeUnit.hp }} / {{ activeUnit.maxHp }}</div>
        <div>AP: {{ activeUnit.ap }} / {{ activeUnit.maxAp }}</div>
        <div>MP: {{ activeUnit.mp }} / {{ activeUnit.maxMp }}</div>
        <div v-if="activeUnit.canLevelUp">
          EXP: {{ activeUnit.exp }} / {{ activeUnit.expToNextLevel }}
        </div>
      </div>
      <div
        class="portrait"
        :style="{ '--bg': `url('${activeUnit.iconPath}')` }"
      />
    </div>
  </div>
</template>

<style scoped lang="postcss">
.active-unit-panel {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--size-4);
}

.portrait {
  width: var(--unit-icon-size);
  aspect-ratio: 1;
  background: var(--bg);
  background-size: cover;
}

.name {
  font-size: var(--font-size-4);
}
</style>
