<script setup lang="ts">
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';
import { useBattleStore } from '@/battle/stores/battle.store';
import { PTransition } from 'vue3-pixi';
import UiAnimatedSprite from '@/ui/scenes/UiAnimatedSprite.vue';
import type { CellViewModel } from '../cell.model';

const { cell } = defineProps<{ cell: CellViewModel }>();

const battleStore = useBattleStore();
const ui = useBattleUiStore();

const isHovered = computed(() => ui.hoveredCell?.id === cell.id);
const tag = computed(() => {
  return ui.controller.getCellHighlightTag(
    cell,
    isHovered.value,
    battleStore.isPlayingFx
  );
});
</script>

<template>
  <UiAnimatedSprite
    v-if="tag"
    assetId="tile-highlights"
    :tag="tag"
    :anchor="0.5"
  />
</template>
