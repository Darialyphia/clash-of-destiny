<script setup lang="ts">
import type { Point } from '@game/shared';
import { Container } from 'pixi.js';
import { useIsoPoint } from '../composables/useIsoPoint';
import { useBattleStore } from '@/battle/stores/battle.store';
import { config } from '@/utils/config';

const {
  position,
  zIndexOffset,
  isAnimated = true
} = defineProps<{
  position: Point;
  zIndexOffset?: number;
  isAnimated?: boolean;
}>();

const { isoPosition, zIndex } = useIsoPoint({
  position: computed(() => position),
  zIndexOffset: computed(() => zIndexOffset)
});

const containerRef = ref<Container>();

const store = useBattleStore();

watch(
  [isoPosition, zIndex, containerRef],
  ([pos, z, container], [, , prevContainer]) => {
    if (!container) return;

    gsap.to(container, {
      duration:
        prevContainer && !store.isPlayingFx && isAnimated
          ? config.ISO_TILES_ROTATION_SPEED
          : 0,
      pixi: {
        x: pos.x,
        y: pos.y,
        zOrder: z,
        zIndex: z
      },
      ease: Power1.easeInOut
    });
  },
  { immediate: true }
);
</script>

<template>
  <container
    ref="containerRef"
    :pivot="{ x: 0, y: 0 }"
    :z-order="zIndex"
    :z-index="zIndex"
  >
    <slot :isoPosition="isoPosition" :z-order="zIndex" />
  </container>
</template>
