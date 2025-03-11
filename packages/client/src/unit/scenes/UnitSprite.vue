<script setup lang="ts">
import { useSpritesheet } from '@/shared/composables/useSpritesheet';
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';
import { OutlineFilter } from '@pixi/filter-outline';
import { AdjustmentFilter } from '@pixi/filter-adjustment';
import { type Filter } from 'pixi.js';
import { useIsoCamera } from '@/iso/composables/useIsoCamera';
import { useMultiLayerTexture } from '@/shared/composables/useMultiLayerTexture';
import { config } from '@/utils/config';
import type { UnitViewModel } from '../unit.model';
import { useGameState } from '@/battle/stores/battle.store';

const { unit, hasFilters = true } = defineProps<{
  unit: UnitViewModel;
  hasFilters?: boolean;
}>();

const sheet = useSpritesheet<'', 'base' | 'destroyed'>(() => unit.spriteId);

const ui = useBattleUiStore();
const camera = useIsoCamera();

const highlghtedFilter = new OutlineFilter(
  camera.viewport.value!.scale.x,
  0xffffff
);
camera.viewport.value?.on('zoomed-end', () => {
  highlghtedFilter.thickness = Math.round(camera.viewport.value!.scale.x);
});

const selectedFilter = new AdjustmentFilter({ brightness: 1.5, blue: 1.25 });

const filters = computed(() => {
  const result: Filter[] = [];

  if (!hasFilters) return result;

  if (ui.highlightedUnit?.id === unit.id) {
    result.push(highlghtedFilter);
  }

  if (ui.selectedUnit?.id === unit.id) {
    result.push(selectedFilter);
  }

  return result;
});
const textures = useMultiLayerTexture({
  sheet,
  parts: () => unit.spriteParts,
  tag: 'idle',
  dimensions: config.UNIT_SPRITE_SIZE
});
</script>

<template>
  <animated-sprite
    v-if="textures.length"
    :textures="textures"
    event-mode="none"
    :filters="filters"
    :anchor="0.5"
  />
</template>
