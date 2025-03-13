<script setup lang="ts">
import { useBattleUiStore } from '../stores/battle-ui.store';
import {
  useBattleStore,
  useGameState,
  useUnits,
  useUserPlayer
} from '../stores/battle.store';

const { state } = useGameState();
const units = useUnits();

const player = useUserPlayer();
const ui = useBattleUiStore();

const turnOrder = computed(() =>
  state.value.turnOrder.map(id => units.value.find(u => u.id === id)!)
);
</script>

<template>
  <div class="flex gap-2 items-center m-3">
    Turn Order
    <button
      v-for="hero in turnOrder"
      :key="hero.id"
      :style="{ '--bg': `url('${hero.iconPath}')` }"
      :class="{ enemy: hero.playerId !== player.id }"
      @mouseenter="ui.highlightUnit(hero)"
      @mouseleave="ui.unhighlightUnit()"
    >
      {{ hero.name }}
    </button>
  </div>
</template>

<style scoped lang="postcss">
button {
  width: var(--unit-icon-size);
  aspect-ratio: 1;
  background: linear-gradient(transparent 30%, hsl(0 0 0 / 0.75)), var(--bg);
  background-size: cover;
  pointer-events: auto;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  text-transform: uppercase;
  padding: var(--size-2);
  font-weight: var(--font-weight-5);
  color: var(--blue-4);
  &.enemy {
    color: var(--red-4);
  }
}
</style>
