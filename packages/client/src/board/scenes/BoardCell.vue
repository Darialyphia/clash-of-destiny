<script setup lang="ts">
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';
import type { SerializedCell } from '@game/engine/src/board/cell';
import BoardCellSprite from '@/board/scenes/BoardCellSprite.vue';
import UiAnimatedSprite from '@/ui/scenes/UiAnimatedSprite.vue';
import AnimatedIsoPoint from '@/iso/components/AnimatedIsoPoint.vue';
import BoardCellHighlights from './BoardCellHighlights.vue';
import { PTransition, type ContainerInst } from 'vue3-pixi';

const { cell } = defineProps<{ cell: SerializedCell }>();

const ui = useBattleUiStore();
const isHovered = computed(() => ui.hoveredCell?.id === cell.id);

const emit = defineEmits<{ ready: [] }>();

const spawnAnimation = (container: ContainerInst) => {
  container.y = -400;
  container.alpha = 0;
  gsap.to(container, {
    y: 0,
    duration: 1,
    ease: Bounce.easeOut,
    delay: Math.random() * 0.5,
    onStart() {
      container.alpha = 1;
    },
    onComplete() {
      emit('ready');
    }
  });
};
</script>

<template>
  <AnimatedIsoPoint
    :position="cell.position"
    @pointerenter="ui.hoverAt(cell.position)"
    @pointerleave="ui.unHover()"
  >
    <PTransition
      appear
      :duration="{ enter: 1000, leave: 0 }"
      @enter="spawnAnimation"
    >
      <container :ref="(container: any) => ui.assignLayer(container, 'scene')">
        <BoardCellSprite :cell="cell" />
        <BoardCellHighlights :cell="cell" />
        <UiAnimatedSprite assetId="hovered-cell" v-if="isHovered" />
      </container>
    </PTransition>
  </AnimatedIsoPoint>
</template>
