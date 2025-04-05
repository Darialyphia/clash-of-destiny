<script setup lang="ts">
import { useTurnPlayer, useUserPlayer } from '@/battle/stores/battle.store';
import type { PlayerViewModel } from '../player.model';
import FancyButton from '@/ui/components/FancyButton.vue';
import UiDrawer from '@/ui/components/UiDrawer.vue';
import CardMiniature from '@/card/components/CardMiniature.vue';
import UiSimpleTooltip from '@/ui/components/UiSimpleTooltip.vue';
import SimpleCardListModal from '@/card/components/SimpleCardListModal.vue';

const { player } = defineProps<{
  player: PlayerViewModel;
}>();

const turnPlayer = useTurnPlayer();

const isDiscardPileModalOpened = ref(false);
const isBanishPileModalOpened = ref(false);
const isDestinyDeckModalOpened = ref(false);

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
            @click="isDiscardPileModalOpened = !isDiscardPileModalOpened"
          >
            {{ discardPile.length }}
          </button>
        </template>
        Discard Pile
      </UiSimpleTooltip>

      <SimpleCardListModal
        v-model="isDiscardPileModalOpened"
        :cards="discardPile"
        :title="`Discard Pile (${discardPile.length})`"
        description=""
      />

      <UiSimpleTooltip>
        <template #trigger>
          <button
            class="toggle banish-pile-toggle"
            @click="isBanishPileModalOpened = !isBanishPileModalOpened"
          >
            {{ banishPile.length }}
          </button>
        </template>
        Banish Pile
      </UiSimpleTooltip>
      <SimpleCardListModal
        v-model="isBanishPileModalOpened"
        :cards="banishPile"
        :title="`Banish Pile (${discardPile.length})`"
        description=""
      />

      <UiSimpleTooltip>
        <template #trigger>
          <button
            class="toggle destiny-deck-toggle"
            :disabled="!userPlayer.equals(player)"
            @click="isDestinyDeckModalOpened = !isDestinyDeckModalOpened"
          >
            {{ destinyDeck.length }}
          </button>
        </template>
        Destiny Deck
      </UiSimpleTooltip>

      <SimpleCardListModal
        v-model="isDestinyDeckModalOpened"
        :cards="destinyDeck"
        :title="`Destiny Deck (${discardPile.length})`"
        description=""
      />
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
