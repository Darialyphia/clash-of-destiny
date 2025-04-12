<script setup lang="ts">
import Fps from '@/shared/components/Fps.vue';
import { useBattleEvent, useBattleStore } from '@/battle/stores/battle.store';
import BattleUi from '@/battle/components/BattleUi.vue';
import { premadeDecks } from '@/utils/premade-decks';
import UiButton from '@/ui/components/UiButton.vue';
import { useLocalStorage } from '@vueuse/core';
import {
  StandardDeckValidator,
  type ValidatableDeck
} from '@game/engine/src/card/validators/deck.validator';
import { CARD_SET_DICTIONARY, type CardSet } from '@game/engine/src/card/sets';
import { keyBy } from 'lodash-es';
import { GameSession } from '@game/engine/src/game/game-session';
import type { GameOptions } from '@game/engine/src/game/game';
import type { Nullable } from '@game/shared';

definePage({
  name: 'Sandbox'
});

const savedDecks = useLocalStorage<ValidatableDeck[]>(
  'clash-of-destiny-decks',
  []
);

const authorizedSets: CardSet[] = [CARD_SET_DICTIONARY.CORE];
const cardPool = keyBy(authorizedSets.map(set => set.cards).flat(), 'id');
const validator = new StandardDeckValidator(cardPool);

const availableDecks = computed(() =>
  savedDecks.value
    .filter(deck => validator.validate(deck).result === 'success')
    .map(deck => ({
      id: deck.id,
      name: deck.name,
      mainDeck: {
        cards: deck.MAIN_DECK.map(card =>
          Array.from({ length: card.copies }, () => card.blueprintId)
        ).flat()
      },
      destinyDeck: {
        cards: deck.DESTINY_DECK.map(card =>
          Array.from({ length: card.copies }, () => card.blueprintId)
        ).flat()
      }
    }))
);
const battleStore = useBattleStore();

const decks = ref<
  [
    Nullable<GameOptions['players'][number]>,
    Nullable<GameOptions['players'][number]>
  ]
>([null, null]);

let session: GameSession;

const start = () => {
  session = new GameSession({
    mapId: '1v1',
    rngSeed: new Date().toISOString(),
    history: [],
    overrides: {},
    players: [
      {
        id: 'p1',
        name: 'Player 1',
        mainDeck: decks.value[0]!.mainDeck,
        destinyDeck: decks.value[0]!.destinyDeck
      },
      {
        id: 'p2',
        name: 'Player 2',
        mainDeck: decks.value[1]!.mainDeck,
        destinyDeck: decks.value[1]!.destinyDeck
      }
    ]
  });
  // @ts-expect-error
  window._debugSession = () => {
    console.log(session.game);
  };
  // @ts-expect-error
  window._debugClient = () => {
    console.log(battleStore.state);
  };
  session.initialize();
  battleStore.init({
    id: 'p1',
    type: 'local',
    subscriber(onSnapshot) {
      session.subscribe(null, onSnapshot);
    },
    initialState:
      session.game.snapshotSystem.getLatestOmniscientSnapshot().state,
    dispatcher: input => {
      session.dispatch(input);
    }
  });
};
</script>

<template>
  <section v-if="!battleStore.isReady" class="pointer-events-auto">
    <div>
      <fieldset>
        <legend>Player 1 deck</legend>
        <label v-for="deck in availableDecks" :key="deck.id">
          <input
            type="radio"
            v-model="decks[0]"
            :value="deck"
            class="sr-only"
          />
          {{ deck.name }}
        </label>
      </fieldset>
      <fieldset>
        <legend>Player 2 deck</legend>
        <label v-for="deck in availableDecks" :key="deck.id">
          <input
            type="radio"
            v-model="decks[1]"
            :value="deck"
            class="sr-only"
          />
          {{ deck.name }}
        </label>
      </fieldset>
    </div>

    <UiButton
      :disabled="!decks[0] || !decks[1]"
      class="primary-button"
      is-cta
      @click="start"
    >
      Start
    </UiButton>
  </section>

  <template v-else>
    <Fps />

    <BattleUi />
  </template>
</template>

<style scoped lang="postcss">
section {
  height: 100dvh;
  display: grid;
  place-content: center;

  > div {
    padding: var(--size-8);
    background: var(--fancy-bg);
    border: var(--fancy-border);

    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--size-9);
  }

  > button {
    justify-self: center;
    margin-top: var(--size-3);
    transition: all 0.3s var(--ease-out-3);

    &:disabled {
      opacity: 0;
      transform: translateY(var(--size-5));
    }
  }
}

fieldset {
  display: flex;
  flex-direction: column;
  gap: var(--size-3);
}

legend {
  margin-bottom: var(--size-3);
}

label {
  display: block;
  border: var(--fancy-border);
  padding: var(--size-5) var(--size-6);
  position: relative;
  cursor: pointer;
  &:hover {
    scale: 1.02;
  }
  &:has(input:checked) {
    color: #d7ad42;
    &::before {
      content: '';
      position: absolute;
      left: var(--size-1);
      top: 50%;
      transform: translateY(-50%);
      width: var(--size-3);
      aspect-ratio: 1;
      background-color: currentColor;
      border-radius: var(--radius-round);
      transition: opacity 0.3s var(--ease-out-2);

      @starting-style {
        opacity: 0;
      }
    }
  }
}
</style>
