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
    ></button>
  </div>
</template>

<style scoped lang="postcss">
button {
  width: var(--unit-icon-size);
  aspect-ratio: 1;
  background: var(--bg);
  background-size: cover;
  pointer-events: auto;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  text-transform: uppercase;
  padding: var(--size-2);
  font-weight: var(--font-weight-5);
  position: relative;
  --color: var(--blue-6);
  --shadow-color: var(--blue-3);

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    display: block;
    transform: translateX(-50%);
    width: var(--size-3);
    aspect-ratio: 1;
    border-radius: var(--radius-round);
    background: radial-gradient(
      circle at center,
      white,
      white 15%,
      var(--color) 70%
    );
    box-shadow: 0 0 var(--size-2) var(--shadow-color);
  }

  &:hover {
    outline: solid var(--border-size-2) var(--yellow-2);
  }
  &.enemy {
    --color: var(--red-6);
    --shadow-color: var(--red-3);
    transform: rotateY(180deg);
  }
}
</style>
