<script setup lang="ts">
import { useBattleUiStore } from '../stores/battle-ui.store';
import { useBattleStore, useGameState } from '../stores/battle.store';

const { state } = useGameState();
const battle = useBattleStore();
const ui = useBattleUiStore();

const switchPlayer = (id: string) => {
  battle.playerId = id;
  ui.unselectUnit();
};
</script>

<template>
  <header>
    {{ state.phase }}
    <button
      @click="switchPlayer('p1')"
      :class="battle.playerId === 'p1' && 'active'"
    >
      Switch to Player 1
    </button>
    <button
      @click="switchPlayer('p2')"
      :class="battle.playerId === 'p2' && 'active'"
    >
      Switch to Player 2
    </button>
  </header>
</template>

<style scoped lang="postcss">
header {
  display: flex;
  gap: var(--size-3);
  justify-content: center;
  padding-block: var(--size-3);
  button {
    border: solid var(--border-size-1) white;
    pointer-events: auto;

    &.active {
      border-width: var(--border-size-2);
      border-color: var(--primary);
    }
  }
}
</style>
