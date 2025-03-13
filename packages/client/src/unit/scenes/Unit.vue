<script setup lang="ts">
import UnitOrientation from './UnitOrientation.vue';
import UnitSprite from './UnitSprite.vue';
import UnitShadow from './UnitShadow.vue';
import UnitPositioner from './UnitPositioner.vue';
import type { Container } from 'pixi.js';
import { PTransition } from 'vue3-pixi';
import { waitFor } from '@game/shared';
import { useBattleEvent, useUserPlayer } from '@/battle/stores/battle.store';
import { useIsoCamera } from '@/iso/composables/useIsoCamera';
import { useAnimatedIsoPoint } from '@/iso/composables/useAnimatedPoint';
import { GAME_EVENTS } from '@game/engine/src/game/game.events';
import type { UnitViewModel } from '../unit.model';
import ActiveUnitIndicator from './ActiveUnitIndicator.vue';
import AlphaTransition from '@/ui/scenes/AlphaTransition.vue';
import UnitSpawnAnimation from './UnitSpawnAnimation.vue';
import HealthBar from './HealthBar.vue';
import ManaBar from './ManaBar.vue';
const { unit } = defineProps<{ unit: UnitViewModel }>();

const camera = useIsoCamera();
const player = useUserPlayer();

const isoPosition = useAnimatedIsoPoint({
  position: computed(() => unit.position)
});
const centerCamera = () => {
  const viewport = camera.viewport.value;
  if (!viewport) return;
  const position = {
    x: isoPosition.value.x + camera.offset.value.x,
    y: isoPosition.value.y + camera.offset.value.y
  };

  const isWithinViewport =
    position.x > viewport.left * 1.35 &&
    position.x < viewport.right * 0.65 &&
    position.y > viewport.top * 1.35 &&
    position.y < viewport.bottom * 0.65;

  if (isWithinViewport) return;

  camera.viewport.value?.animate({
    position,
    time: 500,
    ease: 'easeOutSine'
  });
  return waitFor(250);
};

useBattleEvent(GAME_EVENTS.UNIT_BEFORE_ATTACK, async e => {
  if (unit.equals(e.unit)) {
    await centerCamera();
  }
});
useBattleEvent(GAME_EVENTS.UNIT_BEFORE_RECEIVE_DAMAGE, async e => {
  if (unit.equals(e.unit)) {
    await centerCamera();
  }
});
useBattleEvent(GAME_EVENTS.UNIT_START_TURN, async e => {
  if (unit.equals(e.unit)) {
    await centerCamera();
  }
});

const isSpawnAnimationDone = ref(false);
</script>

<template>
  <UnitPositioner :unit="unit">
    <UnitSpawnAnimation @done="isSpawnAnimationDone = true">
      <UnitOrientation :unit="unit">
        <UnitShadow :unit="unit" />
        <UnitSprite :unit="unit" :alpha="unit.moveIntent ? 0.35 : 1" />
      </UnitOrientation>
    </UnitSpawnAnimation>
    <!-- <UnitVFX :unit="unit" /> -->

    <AlphaTransition
      :duration="{ enter: 200, leave: 200 }"
      v-if="isSpawnAnimationDone"
    >
      <container>
        <ActiveUnitIndicator :unit="unit" />
        <HealthBar :unit="unit" :y="-45" :x="-20" />
        <ManaBar :unit="unit" :y="-40" :x="-20" />
        <!-- <UnitStatsIndicators
          :unit="unit"
          v-if="!unit.isAltar || !unit.isDead"
        />
        <UnitResourceIndicator v-if="unit.isAltar" :unit="unit" />
        <UnitModifierSprite
          v-for="(modifier, index) in unit.modifiers"
          :unit="unit"
          :key="modifier.id"
          :modifier="modifier"
          :index="index"
        /> -->
      </container>
    </AlphaTransition>
  </UnitPositioner>
</template>
