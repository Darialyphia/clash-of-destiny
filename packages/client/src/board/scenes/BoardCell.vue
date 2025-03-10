<script setup lang="ts">
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';
import type { SerializedCell } from '@game/engine/src/board/cell';

const { cell } = defineProps<{ cell: SerializedCell }>();

const ui = useBattleUiStore();
const isHovered = computed(() => ui.hoveredCell?.id === cell.id);
</script>

<template>
  <AnimatedIsoPoint
    :position="cell"
    @pointerenter="ui.hoverAt(cell.position)"
    @pointerleave="ui.unHover()"
  >
    <PTransition appear :duration="{ enter: 1000, leave: 0 }">
      <container :ref="(container: any) => ui.assignLayer(container, 'scene')">
        <BoardCellSprite :cell="cell" />
        <!-- <BoardCellHighlights :cell="cell" /> -->
        <UiAnimatedSprite assetId="hovered-cell" v-if="isHovered" />
      </container>
    </PTransition>
  </AnimatedIsoPoint>
</template>
