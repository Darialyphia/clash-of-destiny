<script setup lang="ts">
import {
  useBattleEvent,
  useGameState,
  useUserPlayer
} from '@/battle/stores/battle.store';
import { GAME_EVENTS } from '@game/engine/src/game/game.events';
import { waitFor } from '@game/shared';

const userPlayer = useUserPlayer();

const text = ref('');
const { state } = useGameState();

useBattleEvent(GAME_EVENTS.TURN_START, async e => {
  text.value = `Turn ${state.value.turnCount + 1}`;

  setTimeout(() => {
    text.value = '';
  }, 1500);
});
</script>

<template>
  <Transition>
    <div class="wrapper" v-if="text">
      <div :data-text="text">{{ text }}</div>
    </div>
  </Transition>
</template>

<style scoped lang="postcss">
.wrapper {
  position: fixed;
  inset: 0;
  display: grid;
  place-content: center;
  font-family: 'NotJamSlab14';
  font-size: 56px;
  pointer-events: none;

  &:is(.v-enter-active, .v-leave-active) {
    transition: all 0.5s var(--ease-2);
  }

  &.v-enter-from {
    transform: scale(0);
    opacity: 0;
  }

  &.v-leave-to {
    transform: translateX(8rem);
    opacity: 0;
  }

  > div {
    position: relative;
    background: linear-gradient(
      #fffe00,
      #fffe00 calc(50% + 3px),
      #feb900 calc(50% + 3px)
    );
    background-clip: text;
    color: transparent;
    position: relative;
    -webkit-text-stroke: 2px black;
    &:after {
      background: none;
      content: attr(data-text);
      position: absolute;
      text-shadow: 0 3px #5d1529;
      inset: 0;
      z-index: -1;
    }
  }
}
</style>
