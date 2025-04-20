<script setup lang="ts">
import { waitFor, type Nullable } from '@game/shared';
import {
  useBattleEvent,
  useCards,
  useDispatcher,
  useGameState
} from '@/battle/stores/battle.store';
import { GAME_EVENTS } from '@game/engine/src/game/game.events';
import { CardViewModel } from '@/card/card.model';
import BattleCard from '@/card/components/BattleCard.vue';

const card = ref<Nullable<CardViewModel>>();
const { state } = useGameState();
const dispatch = useDispatcher();

const cards = useCards();
useBattleEvent(GAME_EVENTS.PLAYER_BEFORE_TRIGGER_SECRET, async event => {
  await waitFor(1000);
  card.value = cards.value.find(c => c.id === event.card.id);
  if (!card.value) {
    const model = new CardViewModel(event.card, state.value.entities, dispatch);
    state.value.entities[event.card.id] = model;
    card.value = model;
  }
  await waitFor(1200);
  card.value = null;
  await waitFor(300);
});
</script>

<template>
  <div class="triggered-secret-backdrop">
    <Transition :duration="{ enter: 1500, leave: 500 }">
      <div class="wrapper" v-if="card">
        <BattleCard :card="card" />
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="postcss">
.triggered-secret-backdrop {
  position: fixed;
  width: 100vw;
  height: 100dvh;
  display: grid;
  place-content: center;
  pointer-events: none;
  transition: background-color 0.5s;
  transform-style: preserve-3d;
  perspective: 900px;
  perspective-origin: center var(--size-13);
}

@keyframes play-card-reveal {
  0%,
  15% {
    transform: rotateY(0.5turn);
  }
  100% {
    transform: rotateY(0);
  }
}

.wrapper {
  transform-style: preserve-3d;
  perspective: 500px;
  perspective-origin: center;
  padding-bottom: var(--size-13);

  &.v-enter-active {
    animation: play-card-reveal 1s var(--ease-3);
  }

  &.v-leave-active {
    transition: all 0.5s var(--ease-3);
  }

  &.v-leave-to {
    opacity: 0;
    transform: translateY(calc(-1 * var(--size-9)));
  }
}
</style>
