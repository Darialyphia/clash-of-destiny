<script setup lang="ts">
import UiModal from '@/ui/components/UiModal.vue';
import {
  useDispatcher,
  useGameState,
  useTurnPlayer
} from '../stores/battle.store';
import { GAME_PHASES } from '@game/engine/src/game/game.enums';
import { VisuallyHidden } from 'reka-ui';
import FancyButton from '@/ui/components/FancyButton.vue';
import { isDefined } from '@game/shared';
import { useBattleUiStore } from '../stores/battle-ui.store';
import {
  HoverCardContent,
  HoverCardRoot,
  HoverCardTrigger,
  HoverCardPortal
} from 'reka-ui';
import BattleCard from '@/card/components/BattleCard.vue';

const { state } = useGameState();
const player = useTurnPlayer();
const ui = useBattleUiStore();

const deck = computed(() => {
  return player.value.getDestinyDeck();
});

const isOpened = ref(false);

watch(
  () => state.value.phase,
  phase => {
    if (phase !== GAME_PHASES.DESTINY) {
      isOpened.value = false;
      return;
    }

    setTimeout(() => {
      isOpened.value = true;
    }, 1000);
  },
  { immediate: true }
);

const selectedCardIndex = ref<number | null>(null);
const dispatch = useDispatcher();

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
    :closable="false"
    :style="{
      '--ui-modal-size': 'var(--size-lg)'
    }"
  >
    <div class="content">
      <h2>You may choose to play one Destiny card</h2>

      <div class="card-list" :class="{ hidden: deck.length === 0 }" ref="root">
        <label v-for="(card, index) in deck" :key="card.id">
          <HoverCardRoot :open-delay="300" :close-delay="0">
            <HoverCardTrigger>
              <BattleCard :card="card" class="card-miniature" />
            </HoverCardTrigger>

            <HoverCardPortal to="#card-portal">
              <HoverCardContent side="right" :side-offset="20">
                <BattleCard :card="card" class="hover-card" />
              </HoverCardContent>
            </HoverCardPortal>
          </HoverCardRoot>
          <VisuallyHidden>
            <input
              type="radio"
              name="destiny-card"
              :value="index"
              v-model="selectedCardIndex"
              :disabled="!card.canPlay"
            />
          </VisuallyHidden>
        </label>
      </div>

      <footer class="flex mt-7 gap-10 justify-center">
        <FancyButton text="Skip" variant="error" @click="skip" />
        <FancyButton
          text="Play"
          @click="play"
          :disabled="selectedCardIndex === null"
        />
      </footer>
    </div>
  </UiModal>
</template>

<style scoped lang="postcss">
.content {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 80dvh;
  overflow: hidden;
}
h2 {
  text-align: center;
  margin-bottom: var(--size-7);
  font-weight: var(--font-weight-4);
}
.card-list {
  display: flex;
  gap: var(--size-5);
  flex-wrap: wrap;
  overflow: auto;
  .hidden {
    opacity: 0;
  }
  > label {
    position: relative;
    width: var(--card-width);
    height: var(--card-height);
    .card-miniature {
      transform: scale(0.5);
      transform-origin: top left;
      transition: transform 0.2s var(--ease-2);
      &:hover {
        transform: scale(0.5) translateY(1rem);
      }
    }

    &:has(input:checked) {
      filter: drop-shadow(0 0 0.5rem yellow);
    }

    &:has(input:disabled) {
      filter: grayscale(1);
    }
  }
}
</style>
