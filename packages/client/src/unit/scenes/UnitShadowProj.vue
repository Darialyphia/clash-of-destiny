<script setup lang="ts">
import { useSpritesheet } from '@/shared/composables/useSpritesheet';
import { type Filter, BlurFilter } from 'pixi.js';
import { config } from '@/utils/config';
import { useMultiLayerTexture } from '@/shared/composables/useMultiLayerTexture';
import { useBattleEvent, useBattleStore } from '@/battle/stores/battle.store';
import { useIsoCamera } from '@/iso/composables/useIsoCamera';
import { GAME_EVENTS } from '@game/engine/src/game/game.events';
import type { UnitViewModel } from '../unit.model';
import { Sprite2d, AFFINE } from 'pixi-projection';

const { unit } = defineProps<{ unit: UnitViewModel }>();

const spritesheet = useSpritesheet(() => unit.spriteId);

const blurFilter = new BlurFilter(0.3, 0.5);

const filters = computed(() => {
  const result: Filter[] = [blurFilter];

  return result;
});

const textures = useMultiLayerTexture({
  sheet: spritesheet,
  parts: {},
  tag: 'idle',
  dimensions: config.UNIT_SPRITE_SIZE
});
const isSpriteFlipped = computed(() => {
  return unit.getPlayer().isPlayer1;
});

const skewX = computed(() => {
  let base = 0.6;
  if (isSpriteFlipped.value) base *= -1;

  return base;
});

const y = computed(() => {
  return -config.UNIT_SPRITE_SIZE.height * 0;
});

useBattleEvent(GAME_EVENTS.UNIT_AFTER_MOVE, async e => {
  if (e.unit.id !== unit.id) return;

  await gsap.to(blurFilter, {
    blur: 2,
    duration: config.MOVEMENT_SPEED_PER_TILE / 2,
    repeat: 1,
    yoyo: true
  });
});
</script>

<template>
  <sprite-2d
    v-if="textures.length"
    :ref="
      (sprite: any) => {
        if (sprite) {
          // (sprite as Sprite2d).proj.affine = AFFINE.AXIS_X;
        }
      }
    "
    :texture="textures[0]"
    event-mode="none"
    :y="y"
    :x="isSpriteFlipped ? 15 : -15"
    :tint="0"
    :anchor="0.5"
    :filters="filters"
    :alpha="0.5"
    :skew-x="skewX"
  />
</template>

<style scoped lang="postcss"></style>
