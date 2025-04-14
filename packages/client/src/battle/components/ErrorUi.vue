<script setup lang="ts">
import { GAME_EVENTS } from '@game/engine/src/game/game.events';
import { useBattleEvent } from '../stores/battle.store';
import UiModal from '@/ui/components/UiModal.vue';
import FancyButton from '@/ui/components/FancyButton.vue';

const isDisplayed = ref(false);
const message = ref('');
const debugDump = ref<any>('');
const isClosable = ref(false);
useBattleEvent(GAME_EVENTS.ERROR, async e => {
  isDisplayed.value = true;
  message.value = e.error;
  isClosable.value = !e.isFatal;
  debugDump.value = JSON.stringify(e.debugDump, null, 2);
});
</script>

<template>
  <UiModal
    v-model:is-opened="isDisplayed"
    :closable="isClosable"
    title="An Error has occured"
    description="message"
  >
    <div class="p-4 bg-black">
      <p v-if="isClosable">
        You seem to have issued an illegal move. Please try again.
      </p>
      <p v-else>
        An unexpected error has resulted in a corrupted game state. The game has
        been cancelled
      </p>
      <details>
        <summary>
          <code>{{ message }}</code>
        </summary>
        <code class="dump">
          {{ debugDump }}
        </code>
      </details>
      <FancyButton
        v-if="isClosable"
        text="Close"
        variant="error"
        @click="isDisplayed = false"
      />
    </div>
  </UiModal>
</template>

<style scoped lang="postcss">
.dump {
  display: block;
  height: 300px;
  overflow: auto;
  white-space: pre-wrap;
}
</style>
