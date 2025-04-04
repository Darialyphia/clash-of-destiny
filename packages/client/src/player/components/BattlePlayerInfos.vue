<script setup lang="ts">
import { useTurnPlayer, useUserPlayer } from '@/battle/stores/battle.store';
import type { PlayerViewModel } from '../player.model';
import FancyButton from '@/ui/components/FancyButton.vue';
import UiDrawer from '@/ui/components/UiDrawer.vue';
import CardMiniature from '@/card/components/CardMiniature.vue';

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
    </div>

    <div class="flex flex-col gap-2 pointer-events-auto">
      <FancyButton
        :text="`Discard Pile (${discardPile.length})`"
        @click="isDiscardPileDrawerOpened = !isDiscardPileDrawerOpened"
      />
      <UiDrawer
        v-model:is-opened="isDiscardPileDrawerOpened"
        :title="`Discard Pile (${discardPile.length})`"
        :position="player.isPlayer1 ? 'left' : 'right'"
      >
        <ul>
          <li v-for="card in discardPile" :key="card.id">
            <CardMiniature :card="card" />
          </li>
        </ul>
        <p v-if="!discardPile.length">Your discard pile is empty.</p>
      </UiDrawer>

      <FancyButton
        :text="`Banish Pile (${banishPile.length})`"
        @click="isBanishPileDrawerOpened = !isBanishPileDrawerOpened"
      />
      <UiDrawer
        v-model:is-opened="isBanishPileDrawerOpened"
        :title="`Banish Pile (${banishPile.length})`"
        :position="player.isPlayer1 ? 'left' : 'right'"
      >
        <ul>
          <li v-for="card in banishPile" :key="card.id">
            <CardMiniature :card="card" />
          </li>
        </ul>
        <p v-if="!banishPile.length">Your banish pile is empty.</p>
      </UiDrawer>

      <FancyButton
        v-if="userPlayer.equals(player)"
        :text="`Destiny Deck (${destinyDeck.length})`"
        @click="isDestinyDeckDrawerOpened = !isDestinyDeckDrawerOpened"
      />
      <UiDrawer
        v-model:is-opened="isDestinyDeckDrawerOpened"
        :title="`Destiny deck (${destinyDeck.length})`"
        :position="player.isPlayer1 ? 'left' : 'right'"
      >
        <ul>
          <li v-for="card in destinyDeck" :key="card.id">
            <CardMiniature :card="card" />
          </li>
        </ul>
        <p v-if="!destinyDeck.length">Your destiny deck is empty.</p>
      </UiDrawer>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.battle-player-infos {
  display: flex;
  gap: var(--size-6);
  &.inverted {
    flex-direction: row-reverse;
  }
  &.is-active .name {
    color: var(--yellow-4);
  }
}

.name {
  font-size: var(--font-size-4);
  font-weight: var(--font-weight-5);
}

ul {
  display: grid;
  gap: var(--size-3);
  height: 100dvh;
  padding: var(--size-5);
}
</style>
