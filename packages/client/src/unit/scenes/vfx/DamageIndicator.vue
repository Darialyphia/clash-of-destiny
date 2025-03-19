<script setup lang="ts">
import { useBattleEvent } from '@/battle/stores/battle.store';
import type { UnitViewModel } from '@/unit/unit.model';
import { GAME_EVENTS } from '@game/engine/src/game/game.events';
import { randomInt, waitFor } from '@game/shared';
import { Container } from 'pixi.js';
import { PTransition } from 'vue3-pixi';

const { unit } = defineProps<{ unit: UnitViewModel }>();

const damageAmount = ref(0);
let direction = 1;

useBattleEvent(GAME_EVENTS.UNIT_BEFORE_RECEIVE_DAMAGE, async e => {
  if (!unit.equals(e.unit)) return;
  damageAmount.value = e.damage;

  await waitFor(1200);
  damageAmount.value = 0;
});

const offset = {
  x: 0,
  y: -50
};
const onEnter = (container: Container) => {
  const target = {
    x: 30 + randomInt(60),
    y: -1 * (40 + randomInt(60))
  };
  gsap.to(container.position, {
    motionPath: [
      { x: offset.x + 0, y: offset.y + 0 },
      { x: offset.x + 0, y: offset.y + target.y }
    ],
    duration: 0.7,
    ease: Power3.easeOut
  });
};
</script>

<template>
  <PTransition
    @enter="onEnter"
    :duration="{ enter: 0, leave: 200 }"
    :leave="{ alpha: 0 }"
  >
    <pixi-text
      v-if="damageAmount"
      v-bind="offset"
      :style="{
        fontFamily: 'NotJamSlab14',
        align: 'center',
        fill: '#ff0000',
        fontSize: 120,
        strokeThickness: 8
      }"
      :scale="0.25"
      :anchor="0.5"
    >
      {{ damageAmount }}
    </pixi-text>
  </PTransition>
</template>
