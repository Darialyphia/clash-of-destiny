<script setup lang="ts">
import { config } from '@/utils/config';
import { type Point } from '@game/shared';
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';
import { useBattleEvent, useUnits } from '@/battle/stores/battle.store';
import type { SerializedUnit } from '@game/engine/src/unit/entities/unit.entity';
import { GAME_EVENTS } from '@game/engine/src/game/game.events';
import type { UnitViewModel } from '../unit.model';

const { unit } = defineProps<{
  unit: UnitViewModel;
}>();

useBattleEvent(GAME_EVENTS.UNIT_AFTER_MOVE, async e => {
  if (!unit.equals(e.unit)) return;

  const tl = gsap.timeline();
  let currentPos = e.previousPosition;

  e.path.forEach(point => {
    const start = currentPos;
    const end = point;
    // const midPoint = {
    //   x: (start.x + end.x) / 2,
    //   y: (start.y + end.y) / 2 - config.MOVEMENT_BOUNCE_HEIGHT
    // };
    currentPos = point;

    tl.to(unit.position, {
      motionPath: [start, end],
      duration: config.MOVEMENT_SPEED_PER_TILE
    });
  });

  await tl.play();
});
const attackAnimation = async (e: { unit: SerializedUnit; target: Point }) => {
  if (!unit.equals(e.unit)) return;
  const start = unit.position;
  const end = e.target;
  const impactPoint = {
    x: start.x + (end.x - start.x) * 0.55,
    y: start.y + (end.y - start.y) * 0.55
    // z: start.z + (end.z - start.z) * 0.55
  };
  const anticipation = {
    x: start.x - (end.x - start.x) * 0.2,
    y: start.y - (end.y - start.y) * 0.2
    // z: start.z - (end.z - start.z) * 0.2
  };
  const tl = gsap.timeline();

  tl.to(unit.position, {
    ...anticipation,
    duration: 0.15
  })
    .to(unit.position, {
      ...impactPoint,
      duration: 0.05,
      ease: Power1.easeIn
    })

    .to(unit.position, {
      ...start,
      duration: 0.1
    });
  await tl.play();
};
useBattleEvent(GAME_EVENTS.UNIT_BEFORE_ATTACK, attackAnimation);
useBattleEvent(GAME_EVENTS.UNIT_BEFORE_COUNTERATTACK, attackAnimation);

const ui = useBattleUiStore();
</script>

<template>
  <container-2d
    :ref="(container: any) => ui.assignLayer(container, 'scene')"
    :position="[
      config.TILE_SIZE_PROJ.x * unit.position.x +
        config.UNIT_SPRITE_OFFSET_PROJ.x,
      config.TILE_SIZE_PROJ.y * unit.position.y +
        config.UNIT_SPRITE_OFFSET_PROJ.y
    ]"
    :z-index="unit.position.y"
  >
    <slot />
  </container-2d>
</template>

<style scoped lang="postcss"></style>
