<script setup lang="ts">
import { useSpritesheet } from '@/shared/composables/useSpritesheet';
import { createSpritesheetFrameObject } from '@/utils/sprite';

const {
  assetId,
  tag = 'idle',
  layer = 'base'
} = defineProps<{
  assetId: string;
  tag?: string;
  layer?: string;
}>();

const sheet = useSpritesheet<'', string>(() => assetId);
const textures = computed(() => {
  if (!sheet.value) return null;
  return createSpritesheetFrameObject(tag, sheet.value.sheets.base[layer]);
});
</script>

<template>
  <sprite-2d
    v-if="textures"
    :x="0"
    event-mode="none"
    playing
    :anchor="0.5"
    :texture="textures[0].texture"
  >
    <slot />
  </sprite-2d>
</template>
