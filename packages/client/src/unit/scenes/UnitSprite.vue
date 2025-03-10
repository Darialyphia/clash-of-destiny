<script setup lang="ts">
import { useSpritesheet } from '@/shared/composables/useSpritesheet';
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';
import { OutlineFilter } from '@pixi/filter-outline';
import { type Filter } from 'pixi.js';
import type { SerializedUnit } from '@game/engine/src/unit/entities/unit.entity';
import { useIsoCamera } from '@/iso/composables/useIsoCamera';
import MultiLayerAnimatedSprite from '@/shared/components/MultiLayerAnimatedSprite.vue';

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

// const modifierSpriteIds = computed(() => {
//   return unit.modifierInfos.map(infos => infos?.spriteId).filter(isDefined);
// });
</script>

<template>
  <MultiLayerAnimatedSprite
    v-if="sheet"
    :sheet="sheet"
    tag="idle"
    :parts="unit.spriteParts"
    :anchor="0.5"
    event-mode="none"
    :filters="filters"
  />
  <!-- <animated-sprite
    :textures="textures"
    :anchor="0.5"
    event-mode="none"
    :filters="filters"
  > -->
  <!-- <UnitModifierSprite
      v-for="modifier in modifierSpriteIds"
      :key="modifier"
      :sprite-id="modifier"
    /> -->
  <!-- </animated-sprite> -->
</template>
