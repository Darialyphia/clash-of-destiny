<script setup lang="ts">
import { useTimeoutFn } from '@vueuse/core';
import { useBattleUiStore } from '../stores/battle-ui.store';
import BattleCard from '@/card/components/BattleCard.vue';

const ui = useBattleUiStore();

const card = computed(() => {
  return ui.highlightedUnit?.getCard();
});

const side = computed(() => {
  if (!card.value) {
    return null;
  }
  return card.value.getPlayer().isPlayer1 ? 'left' : 'right';
});

const isDisplayed = ref(false);

const timeout = useTimeoutFn(() => {
  isDisplayed.value = true;
}, 200);

watch(card, card => {
  if (card) {
    timeout.start();
  } else {
    timeout.stop();
    isDisplayed.value = false;
  }
});
</script>

<template>
  <transition>
    <div class="highlighted-card" :class="side" v-if="card && isDisplayed">
      <BattleCard :card="card" />
    </div>
  </transition>
</template>

<style scoped lang="postcss">
.highlighted-card {
  position: absolute;
  top: 20%;

  &.left {
    left: var(--size-8);
    &.v-enter-from,
    &.v-leave-to {
      transform: translateX(calc(-1 * var(--size-8)));
    }
  }
  &.right {
    right: var(--size-8);
    &.v-enter-from,
    &.v-leave-to {
      transform: translateX(var(--size-8));
    }
  }

  &.v-enter-active,
  &.v-leave-active {
    transition: all 0.2s ease;
  }
  &.v-enter-from,
  &.v-leave-to {
    opacity: 0;
  }
}
</style>
