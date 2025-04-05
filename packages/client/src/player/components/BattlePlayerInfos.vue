<script setup lang="ts">
import { useTurnPlayer, useUserPlayer } from '@/battle/stores/battle.store';
import type { PlayerViewModel } from '../player.model';
import FancyButton from '@/ui/components/FancyButton.vue';
import UiDrawer from '@/ui/components/UiDrawer.vue';
import CardMiniature from '@/card/components/CardMiniature.vue';
import UiSimpleTooltip from '@/ui/components/UiSimpleTooltip.vue';

const { player } = defineProps<{
  player: PlayerViewModel;
}>();

const turnPlayer = useTurnPlayer();

const isDiscardPileDrawerOpened = ref(false);
const isBanishPileDrawerOpened = ref(false);
const isDestinyDeckDrawerOpened = ref(false);

const discardPile = computed(() => {
  return player.getDiscardPile();
});
const banishPile = computed(() => {
  return player.getBanishPile();
});
const destinyDeck = computed(() => {
  return player.getDestinyDeck();
});

const userPlayer = useUserPlayer();
</script>

<template>
  <div
    class="battle-player-infos"
    :class="{
      'is-active': player.equals(turnPlayer),
      inverted: !player.isPlayer1
    }"
  >
    <div>
      <div class="name">{{ player.name }}</div>
      <div>HP: {{ player.currentHp }} / {{ player.maxHp }}</div>
      <div>Mana: {{ player.mana }}</div>
      <div>Destiny: {{ player.destiny }}</div>
      <div>Affinities: {{ player.unlockedAffinities.join(', ') }}</div>
    </div>

    <div class="flex gap-2 pointer-events-auto">
      <UiSimpleTooltip>
        <template #trigger>
          <button
            class="toggle discard-pile-toggle"
            @click="isDiscardPileDrawerOpened = !isDiscardPileDrawerOpened"
          >
            {{ discardPile.length }}
          </button>
        </template>
        Discard Pile
      </UiSimpleTooltip>

      <UiDrawer
        v-model:is-opened="isDiscardPileDrawerOpened"
        :title="`Discard Pile (${discardPile.length})`"
        :position="player.isPlayer1 ? 'left' : 'right'"
      >
        <p v-if="!discardPile.length">Your discard pile is empty.</p>
        <ul v-else>
          <li v-for="card in discardPile" :key="card.id">
            <CardMiniature
              :card="card"
              :side="player.isPlayer1 ? 'right' : 'left'"
            />
          </li>
        </ul>
      </UiDrawer>

      <UiSimpleTooltip>
        <template #trigger>
          <button
            class="toggle banish-pile-toggle"
            @click="isBanishPileDrawerOpened = !isBanishPileDrawerOpened"
          >
            {{ banishPile.length }}
          </button>
        </template>
        Banish Pile
      </UiSimpleTooltip>
      <UiDrawer
        v-model:is-opened="isBanishPileDrawerOpened"
        :title="`Banish Pile (${banishPile.length})`"
        :position="player.isPlayer1 ? 'left' : 'right'"
      >
        <p v-if="!banishPile.length">Your banish pile is empty.</p>
        <ul v-else>
          <li v-for="card in banishPile" :key="card.id">
            <CardMiniature
              :card="card"
              :side="player.isPlayer1 ? 'right' : 'left'"
            />
          </li>
        </ul>
      </UiDrawer>

      <UiSimpleTooltip>
        <template #trigger>
          <button
            class="toggle destiny-deck-toggle"
            :disabled="!userPlayer.equals(player)"
            @click="isDestinyDeckDrawerOpened = !isDestinyDeckDrawerOpened"
          >
            {{ destinyDeck.length }}
          </button>
        </template>
        Destiny Deck
      </UiSimpleTooltip>

      <UiDrawer
        v-model:is-opened="isDestinyDeckDrawerOpened"
        :title="`Destiny deck (${destinyDeck.length})`"
        :position="player.isPlayer1 ? 'left' : 'right'"
      >
        <p v-if="!destinyDeck.length">Your destiny deck is empty.</p>
        <ul v-else>
          <li v-for="card in destinyDeck" :key="card.id">
            <CardMiniature
              :card="card"
              :side="player.isPlayer1 ? 'right' : 'left'"
            />
          </li>
        </ul>
      </UiDrawer>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.battle-player-infos {
  display: flex;
  gap: var(--size-6);
  flex-direction: column;
  --pixel-scale: 2;

  &.is-active .name {
    color: var(--yellow-4);
  }
}

.name {
  font-size: var(--font-size-4);
  font-weight: var(--font-weight-5);
}

ul {
  display: flex;
  flex-direction: column;
  gap: var(--size-3);
  padding: var(--size-5);
}

.discard-pile-toggle {
  background: url('/assets/ui/graveyard-icon.png') no-repeat center;
  background-size: cover;
  width: calc(30px * var(--pixel-scale));
  height: calc(32px * var(--pixel-scale));
  border: none;
  cursor: pointer;
}
.banish-pile-toggle {
  background: url('/assets/ui/banish-icon.png') no-repeat center;
  background-size: cover;
  width: calc(30px * var(--pixel-scale));
  height: calc(32px * var(--pixel-scale));
  border: none;
  cursor: pointer;
}

.destiny-deck-toggle {
  background: url('/assets/ui/destiny-deck-icon.png') no-repeat center;
  background-size: cover;
  width: calc(30px * var(--pixel-scale));
  height: calc(32px * var(--pixel-scale));
  border: none;
  cursor: pointer;

  &:disabled {
    filter: grayscale(1);
  }
}

.toggle {
  display: grid;
  place-content: center;
  font-size: 22px;
  font-family: 'NotJamSlab11', monospace;
}
</style>
