<script setup lang="ts">
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';
import type { SerializedCell } from '@game/engine/src/board/cell';
import BoardCellSprite from '@/board/scenes/BoardCellSprite.vue';
import UiAnimatedSprite from '@/ui/scenes/UiAnimatedSprite.vue';
import AnimatedIsoPoint from '@/iso/components/AnimatedIsoPoint.vue';

const { cell } = defineProps<{ cell: SerializedCell }>();

const ui = useBattleUiStore();
const isHovered = computed(() => ui.hoveredCell?.id === cell.id);
</script>

<template>
  <AnimatedIsoPoint
    :position="cell.position"
    @pointerenter="ui.hoverAt(cell.position)"
    @pointerleave="ui.unHover()"
  >
    <container :ref="(container: any) => ui.assignLayer(container, 'scene')">
      <BoardCellSprite :cell="cell" />
      <!-- <BoardCellHighlights :cell="cell" /> -->
      <UiAnimatedSprite assetId="hovered-cell" v-if="isHovered" />
    </container>
  </AnimatedIsoPoint>
</template>
