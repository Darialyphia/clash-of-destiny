<script setup lang="ts">
import { useSpritesheet } from '@/shared/composables/useSpritesheet';
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';
import { OutlineFilter } from '@pixi/filter-outline';
import { type Filter } from 'pixi.js';
import type { SerializedUnit } from '@game/engine/src/unit/entities/unit.entity';
import { useIsoCamera } from '@/iso/composables/useIsoCamera';
import MultiLayerAnimatedSprite from '@/shared/components/MultiLayerAnimatedSprite.vue';
import { useMultiLayerTexture } from '@/shared/composables/useMultiLayerTexture';
import { config } from '@/utils/config';

const { unit } = defineProps<{ unit: SerializedUnit }>();

const sheet = useSpritesheet<'', 'base' | 'destroyed'>(() => unit.spriteId);
// const textures = computed(() => {
//   if (!sheet.value) return null;
//   return createSpritesheetFrameObject(
//     'idle',
//     unit.isAltar && unit.isDead
//       ? sheet.value.sheets.base.destroyed
//       : sheet.value.sheets.base.base
//   );
// });

const ui = useBattleUiStore();
const camera = useIsoCamera();
const selectedFilter = new OutlineFilter(
  camera.viewport.value!.scale.x,
  0xffffff
);
camera.viewport.value?.on('zoomed-end', () => {
  selectedFilter.thickness = Math.round(camera.viewport.value!.scale.x);
});

const filters = computed(() => {
  const result: Filter[] = [];

  if (ui.highlightedUnit?.id === unit.id) {
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
