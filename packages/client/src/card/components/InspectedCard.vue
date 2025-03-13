<script setup lang="ts">
import { onClickOutside } from '@vueuse/core';
import { isDefined } from '@game/shared';
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';

const wrapper = useTemplateRef('wrapper');

const ui = useBattleUiStore();

onClickOutside(
  wrapper,
  () => {
    ui.uninspectCard();
  },
  {
    ignore: ['#__vue-devtools-container__', '#vue-inspector-container']
  }
);
</script>

<template>
  <Transition>
    <div id="inspected-card-container" v-if="isDefined(ui.inspectedCard)">
      <div ref="wrapper" id="inspected-card"></div>
    </div>
  </Transition>
</template>

<style lang="postcss">
#inspected-card-container {
  pointer-events: auto;
  perspective: 800px;
  position: fixed;
  inset: 0;
  display: grid;
  place-content: center;
  z-index: 2;
  backdrop-filter: blur(5px);
  background-color: hsl(0 0 0 / 0.25);

  &:is(.v-enter-active, .v-leave-active) {
    transition: all 0.2s var(--ease-out-2);
  }

  &:is(.v-enter-from, .v-leave-to) {
    background-color: transparent;
    backdrop-filter: none;
  }
}

#inspected-card {
  --pixel-scale: 2;
  width: calc(126px * var(--pixel-scale));
  height: calc(178px * var(--pixel-scale));
  > * {
    width: 100%;
    height: 100%;
  }
}
</style>
