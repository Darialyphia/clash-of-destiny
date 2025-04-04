<script setup lang="ts">
import UiModal from '@/ui/components/UiModal.vue';
import { useDispatcher, useGameState, useTurnPlayer } from '../stores/battle.store';
import { GAME_PHASES } from '@game/engine/src/game/game.enums';
import { VisuallyHidden } from 'reka-ui';
import FancyButton from '@/ui/components/FancyButton.vue';
import { isDefined } from '@game/shared';
import { useBattleUiStore } from '../stores/battle-ui.store';

const { state } = useGameState();
const player = useTurnPlayer();
const ui = useBattleUiStore()

const deck = computed(() => {
  return player.value.getDestinyDeck();
});

const isOpened = ref(false);

watch(
  () => state.value.phase,
  phase => {
    isOpened.value = phase === GAME_PHASES.DESTINY;
  },
  { immediate: true }
);

const selectedCardIndex = ref<number | null>(null);
const dispatch = useDispatcher()

const skip = () => {
  dispatch({
    type: 'skipDestiny',
    payload: {
      playerId: player.value.id
    }
  });
};

const play = () => {
  if (!isDefined(selectedCardIndex.value)) return;

  dispatch({
    type: 'playDestinyCard',
    payload: {
      playerId: player.value.id,
      index: selectedCardIndex.value
    }
  });

  isOpened.value = false;
  ui.cardPlayIntent = deck.value[selectedCardIndex.value];
  selectedCardIndex.value = null;
};
</script>

<template>
  <UiModal
    v-model:is-opened="isOpened"
    title="Destiny Phase"
    description="You may choose to play one Destiny card"
  >
    <h2>You may choose to play one Destiny card</h2>

    <ul class="grid gap-3">
      <li v-for="(card, index) in deck" :key="card.id">
        <label>
          <div class="card-miniature">
            <span>{{ card.name }}</span>
            <span>Cost: {{ card.destinyCost }}</span>
            <VisuallyHidden>
              <input
                type="radio"
                name="destiny-card"
                :value="index"
                v-model="selectedCardIndex"
                :disabled="card.destinyCost! > player.destiny"
            </VisuallyHidden>
          </div>
        </label>
      </li>
    </ul>

      <footer class="flex mt-7 gap-10 justify-center">
        <FancyButton
          text="Skip"
          variant="error"
          @click="skip"
        />
        <FancyButton text="Play" @click="play" :disabled="selectedCardIndex === null"/>
      </footer>
  </UiModal>
</template>

<style scoped lang="postcss">
h2 {
  text-align: center;
  margin-bottom: var(--size-7);
  font-weight: var(--font-weight-4);
}

.card-miniature {
  display: flex;
  gap: var(--size-5);
  align-items: center;
  padding: var(--size-5);
  background-color: #32021b;
  border: solid 6px #efef9f;
  border-right-color: #d7ad42;
  border-bottom-color: #d7ad42;
  box-shadow: 3px 3px 0 black;


  cursor: pointer;
  transition: background-color 0.3s var(--ease-2);

  &:hover {
    background-color: #5d1529;
  }

   &:has(input:checked) {
      filter: drop-shadow(0 0 0.5rem yellow);
    }

    &:has(input:disabled) {
      filter: grayscale(1);
    }
}
</style>
