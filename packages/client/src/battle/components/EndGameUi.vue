<script setup lang="ts">
import { RouterLink } from 'vue-router';
import UiModal from '@/ui/components/UiModal.vue';
import { useGameState, useUserPlayer } from '../stores/battle.store';
import UiButton from '@/ui/components/UiButton.vue';
import { GAME_PHASES } from '@game/engine/src/game/game.enums';

const { state } = useGameState();
const player = useUserPlayer();
</script>

<template>
  <UiModal
    :is-opened="state.phase === GAME_PHASES.GAME_END"
    :closable="false"
    title="Game Over"
    description="The game has ended."
  >
    <div class="end-game-ui">
      <!-- <h2>{{ player.equals(state.winner!) ? 'VICTORY' : 'DEFEAT' }}</h2> -->
      <RouterLink :to="{ name: 'Home' }" custom v-slot="{ href, navigate }">
        <UiButton :href @click="navigate" class="primary-button" is-cta>
          Continue
        </UiButton>
      </RouterLink>
    </div>
  </UiModal>
</template>

<style scoped lang="postcss">
.end-game-ui {
  display: grid;
  justify-items: center;
  gap: var(--size-6);
  background: var(--fancy-bg);
  border: var(--fancy-border);
  padding: var(--size-8);
  color: #d7ad42;
  font-family: 'Press Start 2P';
}

h2 {
  background: linear-gradient(
    #fffe00,
    #fffe00 calc(50% + 3px),
    #feb900 calc(50% + 3px)
  );
  background-clip: text;
  color: transparent;
  position: relative;
}
</style>
