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
  <transition appear mode="out-in">
    <div class="wrapper" v-if="isActiveUnitOwner" :key="activeUnit.id">
      <div class="flex flex-col gap-3 justify-end">
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
      <div class="active-unit-panel">
        <div>
          <div class="name">{{ activeUnit.name }}</div>
          <div>HP: {{ activeUnit.hp }} / {{ activeUnit.maxHp }}</div>
          <div>AP: {{ activeUnit.ap }} / {{ activeUnit.maxAp }}</div>
          <div>MP: {{ activeUnit.mp }} / {{ activeUnit.maxMp }}</div>
          <div v-if="!activeUnit.isMaxLevel">
            EXP: {{ activeUnit.exp }} / {{ activeUnit.expToNextLevel }}
          </div>
        </div>
        <div>
          <div>Deck: {{ activeUnit.remainingCardsInDeck }}</div>
          <div>Hand: {{ activeUnit.handSize }}</div>
          <div>Discard pile: {{ activeUnit.getDiscardPile().length }}</div>
        </div>
        <div
          class="portrait"
          :style="{ '--bg': `url('${activeUnit.iconPath}')` }"
        />
      </div>
    </div>
  </transition>
</template>

<style scoped lang="postcss">
.wrapper {
  display: flex;
  gap: var(--size-4);
  padding: var(--size-5);

  &.v-enter-active,
  &.v-leave-active {
    transition: all 0.35s var(--ease-spring-2);
  }

  &.v-enter-from,
  &.v-leave-to {
    opacity: 0;
    transform: translateX(25%);
  }
}
.active-unit-panel {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: var(--size-4);
  padding: var(--size-5);
  background-color: #32021b;
  border: solid 6px #efef9f;
  border-right-color: #d7ad42;
  border-bottom-color: #d7ad42;
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
