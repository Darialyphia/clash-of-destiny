<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { useLocalStorage } from '@vueuse/core';
import { CARD_SET_DICTIONARY, type CardSet } from '@game/engine/src/card/sets';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  UNIT_KINDS
} from '@game/engine/src/card/card.enums';
import BlueprintCard from '@/card/components/BlueprintCard.vue';
import { domToPng } from 'modern-screenshot';
import {
  StandardDeckValidator,
  type ValidatableDeck
} from '@game/engine/src/card/validators/deck.validator';
import { DeckBuildervModel } from '@/card/deck-builder.model';
import { keyBy } from 'lodash-es';
import FancyButton from '@/ui/components/FancyButton.vue';
import { Icon } from '@iconify/vue';

definePage({
  name: 'Collection'
});

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
      if (a.deckSource !== b.deckSource) {
        return a.deckSource === CARD_DECK_SOURCES.MAIN_DECK ? 1 : -1;
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

const decks = useLocalStorage<ValidatableDeck[]>('clash-of-destiny-decks', []);
const collection = computed(() =>
  authorizedSets
    .map(set => set.cards.map(card => ({ blueprint: card, copiesOwned: 4 })))
    .flat()
);

const deckBuilder = ref(
  new DeckBuildervModel(
    collection.value,
    new StandardDeckValidator(keyBy(cards.value, 'id'))
  )
);

const isEditing = ref(false);
const createDeck = () => {
  deckBuilder.value.reset();
  isEditing.value = true;
};

const editDeck = (deck: ValidatableDeck) => {
  deckBuilder.value.loadDeck(deck);
  isEditing.value = true;
};

const screenshot = async (id: string, e: MouseEvent) => {
  const card = (e.target as HTMLElement)
    .closest('li')
    ?.querySelector('.card-front') as HTMLElement;
  const png = await domToPng(card, {
    backgroundColor: 'transparent'
  });
  const a = document.createElement('a');
  a.href = png;
  a.download = `${id}.png`;
  a.click();
};

const saveDeck = () => {
  const existingDeck = decks.value.find(
    deck => deck.id === deckBuilder.value.deck.id
  );
  if (existingDeck) {
    existingDeck.name = deckBuilder.value.deck.name;
    existingDeck.MAIN_DECK = deckBuilder.value.deck.MAIN_DECK;
    existingDeck.DESTINY_DECK = deckBuilder.value.deck.DESTINY_DECK;
  } else {
    decks.value.push(deckBuilder.value.deck);
  }
  isEditing.value = false;
  deckBuilder.value.reset();
};
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
          :class="{ disabled: !deckBuilder.canAdd(card.id) }"
          @click="
            () => {
              if (!isEditing) return;
              if (deckBuilder.canAdd(card.id)) {
                deckBuilder.addCard(card.id);
              }
            }
          "
        />
        <button v-if="!isEditing" @click="screenshot(card.id, $event)">
          Screenshot
        </button>
      </li>
    </ul>
    <aside>
      <template v-if="!isEditing">
        <p v-if="!decks.length">You haven't created any deck yet.</p>
        <ul class="mb-5">
          <li
            v-for="(deck, index) in decks"
            :key="index"
            class="flex gap-2 items-center"
          >
            <button class="flex-1 text-left" @click="editDeck(deck)">
              {{ deck.name }}
            </button>

            <FancyButton
              variant="error"
              text="Delete"
              @click="decks.splice(decks.indexOf(deck), 1)"
            />
          </li>
        </ul>
        <FancyButton
          class="primary-button"
          text="New Deck"
          @click="createDeck"
        />
      </template>
      <div class="deck" v-else>
        <div class="flex gap-2">
          <Icon icon="material-symbols:edit-outline" />
          <input v-model="deckBuilder.deck.name" type="text" />
        </div>
        <div class="overflow-y-auto">
          <div class="text-3 my-5 font-500">
            Main deck ({{ deckBuilder.mainDeckSize }} /
            {{ deckBuilder.validator.mainDeckSize }})
          </div>
          <ul>
            <li
              v-for="(card, index) in deckBuilder.mainDeckCards"
              :key="index"
              :style="{
                '--bg': `url(/assets/icons/${card.blueprint.cardIconId}.png)`
              }"
              :class="card.blueprint.kind.toLocaleLowerCase()"
              class="deck-item"
              @click="deckBuilder.removeCard(card.blueprintId)"
            >
              <div class="mana-cost">{{ card.blueprint.manaCost }}</div>
              {{ card.blueprint.name }} X {{ card.copies }}
            </li>
          </ul>

          <div class="text-3 my-5 font-500">
            Destiny Deck ({{ deckBuilder.destinyDeckSize }} /
            {{ deckBuilder.validator.destinyDeckSize }})
          </div>
          <ul>
            <li
              v-for="(card, index) in deckBuilder.destinyDeckCards"
              :key="index"
              :style="{
                '--bg': `url(/assets/icons/${card.blueprint.cardIconId}.png)`
              }"
              :class="card.blueprint.kind.toLocaleLowerCase()"
              class="deck-item"
              @click="deckBuilder.removeCard(card.blueprintId)"
            >
              <div class="destiny-cost">{{ card.blueprint.destinyCost }}</div>
              {{ card.blueprint.name }} X {{ card.copies }}
            </li>
          </ul>
        </div>
        <div class="flex gap-2">
          <FancyButton text="Back" variat="error" @click="isEditing = false" />
          <FancyButton text="Save" @click="saveDeck" />
        </div>
      </div>
    </aside>
  </div>
</template>

<style scoped lang="postcss">
.page {
  overflow: hidden;
  height: 100dvh;
  pointer-events: auto;
  display: grid;
  grid-template-columns: 1fr var(--size-xs);

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
}

.deck-item {
  display: flex;
  gap: var(--size-3);
  align-items: center;
  border: solid var(--border-size-1) #d7ad42;
  margin-block: var(--size-2);
  padding: var(--size-3);
  cursor: url('/assets/ui/cursor-hover.png'), auto;
  background-image: linear-gradient(
      hsl(0deg 0% 0% / 0.5),
      hsl(0deg 0% 0% / 0.5)
    ),
    var(--bg);
  background-repeat: no-repeat;
  background-position:
    center center,
    calc(100% + 40px) -70px;
  background-size: 200%, calc(2px * 96);
  text-shadow: 0 0 1rem 1rem black;
  transition: all 0.3s var(--ease-2);
  &.spell,
  &.artifact {
    background-position:
      center center,
      calc(100% + 40px);
  }

  &:hover {
    background-image: linear-gradient(
        hsl(0deg 0% 0% / 0.25),
        hsl(0deg 0% 0% / 0.25)
      ),
      var(--bg);
    background-size: 200%, calc(2.25 * 96px);
    background-position:
      center center,
      calc(100% + 50px) -85px;
  }
}

li {
  position: relative;
}

.mana-cost {
  background-color: #5185ff;
  font-size: var(--size-3);
  font-weight: var(--weight-500);
  font-weight: var(--font-weight-7);
  border-radius: var(--radius-round);
  width: var(--size-5);
  height: var(--size-5);
  display: grid;
  place-content: center;
  -webkit-text-stroke: 4px black;
  paint-order: stroke fill;
}

.destiny-cost {
  background-color: #feb500;
  font-size: var(--size-3);
  font-weight: var(--weight-500);
  font-weight: var(--font-weight-7);
  border-radius: var(--radius-round);
  width: var(--size-5);
  height: var(--size-5);
  display: grid;
  place-content: center;
  -webkit-text-stroke: 4px black;
  paint-order: stroke fill;
}
</style>
