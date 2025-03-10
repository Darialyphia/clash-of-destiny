<script setup lang="ts">
import { useSpritesheet } from '@/shared/composables/useSpritesheet';
import { Hitbox } from '@/utils/hitbox';
import { config } from '@/utils/config';
import type { SerializedCell } from '@game/engine/src/board/cell';

const { cell } = defineProps<{ cell: SerializedCell }>();

const sheet = useSpritesheet<'', 'tile'>(() => cell.spriteId);

const { w, h } = { w: 96, h: 80 };
const { offsetW, offsetH } = {
  offsetW: -config.TILE_SIZE.x / 2,
  offsetH: -config.TILE_SIZE.z * 2.5
};
const hitArea = Hitbox.from(
  [
    [
      offsetW + w * 0,
      offsetH + h * 0.5,

      offsetW + w * 0.5,
      offsetH + h * 0.2,

      offsetW + w,
      offsetH + h * 0.5,

      offsetW + w,
      offsetH + h * 0.7,

      offsetW + w * 0.5,
      offsetH + h,

      offsetW + w * 0,
      offsetH + h * 0.7
    ]
  ],
  { width: 96, height: 80 },
  {
    x: 0,
    y: 0
  }
);
</script>

<template>
  <animated-sprite
    v-if="sheet"
    :anchor="0.5"
    :hitArea="hitArea"
    :textures="sheet.sheets.base.tile.animations[0]"
  >
    <!-- <graphics
      @render="
        g => {
          g.clear();
          g.lineStyle({ color: 'red', width: 3 });
          hitArea.shape.forEach(polygon => {
            g.drawPolygon(polygon);
          });
        }
      "
    /> -->
  </animated-sprite>
</template>
