<script setup lang="ts">
import UiModal from '@/ui/components/UiModal.vue';
import type { CardViewModel } from '../card.model';
import BattleCard from './BattleCard.vue';
import {
  HoverCardContent,
  HoverCardRoot,
  HoverCardTrigger,
  HoverCardPortal
} from 'reka-ui';
import FancyButton from '@/ui/components/FancyButton.vue';
import {
  useDispatcher,
  useTurnPlayer,
  useUserPlayer
} from '@/battle/stores/battle.store';
import type { PlayerViewModel } from '@/player/player.model';

const { cards, title, description } = defineProps<{
  cards: CardViewModel[];
  title: string;
  description: string;
  player: PlayerViewModel;
}>();

const isOpened = defineModel<boolean>({ required: true });
const dispatch = useDispatcher();

const turnPlayer = useTurnPlayer();
const userPlayer = useUserPlayer();
</script>

<template>
  <UiModal
    :title="title"
    :description="description"
    v-model:is-opened="isOpened"
    :style="{
      '--ui-modal-size': 'var(--size-lg)'
    }"
  >
    <section>
      <div class="simple-card-list-modal" @click="isOpened = false">
        <h2>{{ description }}</h2>
        <div class="card-list">
          <HoverCardRoot
            v-for="(card, index) in cards"
            :key="card.id"
            :open-delay="150"
            :close-delay="0"
          >
            <HoverCardTrigger>
              <BattleCard :card="card" class="card-miniature" @click.stop />
            </HoverCardTrigger>

            <HoverCardPortal to="#hover-card">
              <Transition :duration="{ enter: 300, leave: 0 }">
                <HoverCardContent
                  side="right"
                  :side-offset="-240"
                  align="start"
                  :align-offset="-140"
                >
                  <BattleCard :card="card" class="hover-card" />
                  <template
                    v-if="
                      userPlayer.equals(turnPlayer) && userPlayer.equals(player)
                    "
                  >
                    <FancyButton
                      v-for="ability in card.usableAbilities"
                      :key="ability.id"
                      :text="ability.label"
                      @click="
                        dispatch({
                          type: 'useCardAbility',
                          payload: {
                            abilityId: ability.id,
                            cardId: card.id
                          }
                        });
                        isOpened = false;
                      "
                    />
                  </template>
                </HoverCardContent>
              </Transition>
            </HoverCardPortal>
          </HoverCardRoot>
        </div>
      </div>
      <div id="hover-card" />
    </section>
  </UiModal>
</template>

<style scoped lang="postcss">
h2 {
  text-align: center;
  margin-bottom: var(--size-7);
  font-weight: var(--font-weight-4);
}

.simple-card-list-modal {
  display: grid;
  grid-template-rows: auto 1fr;
  height: 80dvh;
  overflow: hidden;
}
.card-list {
  display: flex;
  gap: var(--size-5);
  flex-wrap: wrap;
  overflow: auto;
  .hidden {
    opacity: 0;
  }
  > * {
    position: relative;
    width: var(--card-width);
    height: var(--card-height);
    .card-miniature {
      transform: scale(0.5);
      transform-origin: top left;
      transition: transform 0.2s var(--ease-2);
    }

    &:has(input:checked) {
      filter: drop-shadow(0 0 0.5rem yellow);
    }

    &:has(input:disabled) {
      filter: grayscale(1);
    }
  }
}

.v-enter-active .hover-card {
  transition: scale 0.3s var(--ease-2);
}
.v-enter-from .hover-card {
  scale: 0.5;
}
</style>
