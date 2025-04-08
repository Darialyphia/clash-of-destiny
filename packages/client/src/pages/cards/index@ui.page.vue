<script setup lang="ts">
import { RouterLink } from 'vue-router';
import Card from '@/card/components/Card.vue';
import { useLocalStorage } from '@vueuse/core';
import UiButton from '@/ui/components/UiButton.vue';
import type { Nullable } from '@game/shared';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import {
  CARD_SET_DICTIONARY,
  CARDS_DICTIONARY,
  type CardSet
} from '@game/engine/src/card/sets';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  UNIT_KINDS
} from '@game/engine/src/card/card.enums';
import { match } from 'ts-pattern';
import BlueprintCard from '@/card/components/BlueprintCard.vue';

definePage({
  name: 'Collection'
});

const DECK_SIZE = 30;
const MAX_CARD_COPIES = 3;

const authorizedSets: CardSet[] = [CARD_SET_DICTIONARY.CORE];

const KIND_ORDER = {
  [CARD_KINDS.UNIT]: 1,
  [CARD_KINDS.SPELL]: 2,
  [CARD_KINDS.ARTIFACT]: 3,
  [CARD_KINDS.SECRET]: 4
};

const UNIT_KIND_ORDER = {
  [UNIT_KINDS.SHRINE]: 1,
  [UNIT_KINDS.HERO]: 2,
  [UNIT_KINDS.MINION]: 3
};
const cards = computed(() => {
  return authorizedSets
    .map(set => set.cards)
    .flat()
    .sort((a, b) => {
      if (
        a.deckSource === CARD_DECK_SOURCES.DESTINY_DECK &&
        b.deckSource !== CARD_DECK_SOURCES.DESTINY_DECK
      ) {
        return -1;
      }
      if (
        a.deckSource !== CARD_DECK_SOURCES.MAIN_DECK &&
        b.deckSource === CARD_DECK_SOURCES.MAIN_DECK
      ) {
        return 1;
      }

      if (a.kind === b.kind) {
        if (a.kind === CARD_KINDS.UNIT && b.kind === CARD_KINDS.UNIT) {
          if (a.unitKind !== b.unitKind) {
            return UNIT_KIND_ORDER[a.unitKind] - UNIT_KIND_ORDER[b.unitKind];
          }
        }

        if (
          a.deckSource === CARD_DECK_SOURCES.MAIN_DECK &&
          b.deckSource === CARD_DECK_SOURCES.MAIN_DECK &&
          a.manaCost !== b.manaCost
        ) {
          return a.manaCost - b.manaCost;
        }

        if (
          a.deckSource === CARD_DECK_SOURCES.DESTINY_DECK &&
          b.deckSource === CARD_DECK_SOURCES.DESTINY_DECK &&
          a.destinyCost !== b.destinyCost
        ) {
          return a.destinyCost - b.destinyCost;
        }
        return a.name
          .toLocaleLowerCase()
          .localeCompare(b.name.toLocaleLowerCase());
      }
      return KIND_ORDER[a.kind] - KIND_ORDER[b.kind];
    });
});

type Deck = {
  name: string;
  cards: string[];
};
const decks = useLocalStorage<Deck[]>('decks', []);

const createDeck = () => {
  decks.value.push({ name: `New Deck(${decks.value.length + 1})`, cards: [] });
  selectedDeck.value = decks.value.at(-1)!;
};
const selectedDeck = ref<Nullable<Deck>>(null);

const hasMaxCopies = (card: CardBlueprint) => {
  if (!selectedDeck.value) return false;
  return (
    selectedDeck.value.cards.filter(id => id === card.id).length >=
    MAX_CARD_COPIES
  );
};

// const selectedDeckContent = computed(() => {
//   if (!selectedDeck.value) return [];
//   const deckCards = selectedDeck.value.cards.map(
//     id => cards.value.find(card => card.id === id)!
//   );
//   console.log(selectedDeck.value.cards);
//   const grouped = Object.groupBy(deckCards, card => card.id);
//   return Object.entries(grouped)
//     .map(([id, copies]) => ({
//       id,
//       name: copies![0].name,
//       copies: copies!.length,
//       blueprint: copies![0]
//     }))
//     .sort((a, b) => a.blueprint.cost.gold - b.blueprint.cost.gold);
// });
</script>

<template>
  <div class="page">
    <nav class="pointer-events-auto">
      <ul class="flex gap-4">
        <li>
          <RouterLink :to="{ name: 'Home' }">Home</RouterLink>
        </li>
        <li>
          <RouterLink :to="{ name: 'Sandbox' }">Sandbox</RouterLink>
        </li>
      </ul>
    </nav>
    <ul class="cards">
      <li v-for="card in cards" :key="card.id">
        <BlueprintCard
          :blueprint="card"
          :class="hasMaxCopies(card) && 'disabled'"
          @click="
            () => {
              if (!selectedDeck) return;
              const canAdd = !hasMaxCopies(card);
              if (!canAdd) return;
              selectedDeck.cards.push(card.id);
            }
          "
        />
      </li>
    </ul>
    <!-- <aside>
      <template v-if="!selectedDeck">
        <p v-if="!decks.length">You haven't created any deck yet.</p>

        <ul class="mb-5">
          <li
            v-for="(deck, index) in decks"
            :key="index"
            class="flex gap-2 items-center"
          >
            {{ deck.name }}
            <UiButton class="primary-button" @click="selectedDeck = deck">
              Edit
            </UiButton>
            <UiButton
              class="error-button"
              @click="decks.splice(decks.indexOf(deck), 1)"
            >
              Delete
            </UiButton>
          </li>
        </ul>
        <UiButton class="primary-button" @click="createDeck">New deck</UiButton>
      </template>
      <div class="deck" v-else>
        <div class="flex justiy-between">
          <input v-model="selectedDeck.name" />
          {{ selectedDeck.cards.length }} / {{ DECK_SIZE }}
        </div>
        <ul>
          <li
            v-for="card in selectedDeckContent"
            :key="card.id"
            class="deck-item"
            @click="
              () => {
                const idx = selectedDeck?.cards.findIndex(c => c === card.id)!;
                selectedDeck?.cards.splice(idx, 1);
              }
            "
          >
            <CardIcon :card="card.blueprint" />
            {{ card.name }} X {{ card.copies }}
          </li>
        </ul>
        <UiButton class="primary-button" @click="selectedDeck = null">
          Back
        </UiButton>
      </div>
      TODO deck builder
    </aside> -->
  </div>
</template>

<style scoped lang="postcss">
.page {
  overflow: hidden;
  height: 100dvh;
  pointer-events: auto;
  display: grid;
  /* grid-template-columns: 1fr var(--size-xs); */

  > nav {
    grid-column: 1 / -1;
  }
}

aside {
  padding: var(--size-3);
  overflow-y: hidden;
}
.cards {
  gap: var(--size-6);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(19rem, 1fr));
  justify-items: center;
  overflow-y: auto;
}

.card.disabled {
  filter: grayscale(100%);
}

.card:not(.disabled):hover {
  cursor: url('/assets/ui/cursor-hover.png'), auto;
}

.deck {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100%;
  > ul {
    overflow-y: auto;
  }
}
.deck-item {
  display: flex;
  gap: var(--size-3);
  align-items: center;
  border: solid var(--border-size-1) #d7ad42;
  margin-block: var(--size-2);
  cursor: url('/assets/ui/cursor-hover.png'), auto;
  &:hover {
    filter: brightness(135%);
  }
}
</style>
