<script setup lang="ts">
import { useBattleEvent, useUserPlayer } from '@/battle/stores/battle.store';
import { GAME_PHASES } from '@game/engine/src/game/game.enums';
import { GAME_EVENTS } from '@game/engine/src/game/game.events';
import { waitFor } from '@game/shared';

const userPlayer = useUserPlayer();

const text = ref('');
const overdriveReminder = ref('');

useBattleEvent(GAME_EVENTS.PLAYER_START_TURN, async e => {
  text.value =
    userPlayer.value.id === e.player.id
      ? 'Your turn'
      : `${e.player.name}'s turn`;

  overdriveReminder.value =
    e.player.turnsUntilOverdriveMode > 0
      ? `${e.player.turnsUntilOverdriveMode} turns until overrive!`
      : 'Overdrive activated !';

  await waitFor(1200);
  text.value = '';
});
</script>

<template>
  <Transition>
    <div class="wrapper" v-if="text">
      <div :data-text="text">{{ text }}</div>
      <div :data-text="overdriveReminder">{{ overdriveReminder }}</div>
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
