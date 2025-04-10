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
      <div class="indicators">
        <UiSimpleTooltip>
          <template #trigger>
            <div>
              {{ player.currentHp }}
            </div>
          </template>
          Health Points
        </UiSimpleTooltip>
        <div>
          <UiSimpleTooltip>
            <template #trigger>
              <div>
                {{ player.mana }}
              </div>
            </template>
            Mana
          </UiSimpleTooltip>
        </div>
        <div>
          <UiSimpleTooltip>
            <template #trigger>
              <div>
                {{ player.destiny }}
              </div>
            </template>
            Destiny
          </UiSimpleTooltip>
        </div>
      </div>
    </div>

    <div
      class="flex pointer-events-auto"
      :class="!player.isPlayer1 && 'flex-row-reverse'"
    >
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
        :player="player"
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
        :player="player"
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
        :player="player"
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

  &:not(.inverted) {
    padding-inline-start: var(--size-11);
  }

  &.inverted {
    padding-inline-end: var(--size-11);
  }

  &.inverted .name {
    text-align: right;
  }

  &.inverted .indicators {
    flex-direction: row-reverse;
  }
}

.name {
  font-size: var(--font-size-5);
  font-weight: var(--font-weight-5);
  -webkit-text-stroke: 4px black;
  paint-order: stroke fill;
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

.indicators {
  display: flex;
  gap: var(--size-6);
  font-size: var(--font-size-5);
  font-weight: var(--font-weight-7);
  color: var(--white-1);
  -webkit-text-stroke: 4px black;
  paint-order: stroke fill;
  pointer-events: auto;
  --pixel-scale: 2;

  > div {
    display: grid;
    place-content: center;
    width: calc(32px * var(--pixel-scale));
    height: calc(40px * var(--pixel-scale));
    padding-bottom: 16px;

    &:nth-of-type(1) {
      background: url('/assets/icons/player-infos-hp.png') no-repeat center;
      background-size: cover;
    }
    &:nth-of-type(2) {
      background: url('/assets/icons/player-infos-mana.png') no-repeat center;
      background-size: cover;
    }
    &:nth-of-type(3) {
      background: url('/assets/icons/player-infos-destiny.png') no-repeat center;
      background-size: cover;
    }
  }
}
</style>
