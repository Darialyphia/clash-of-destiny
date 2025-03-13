<script setup lang="ts">
import UnitOrientation from './UnitOrientation.vue';
import UnitSprite from './UnitSprite.vue';
import UnitShadow from './UnitShadow.vue';
import UnitPositioner from './UnitPositioner.vue';
import type { Container } from 'pixi.js';
import { waitFor } from '@game/shared';
import {
  GAME_TYPES,
  useBattleEvent,
  useGameState,
  useUserPlayer
} from '@/battle/stores/battle.store';
import { useIsoCamera } from '@/iso/composables/useIsoCamera';
import { useAnimatedIsoPoint } from '@/iso/composables/useAnimatedPoint';
import { GAME_EVENTS } from '@game/engine/src/game/game.events';
import type { UnitViewModel } from '../unit.model';
import ActiveUnitIndicator from './ActiveUnitIndicator.vue';
import AlphaTransition from '@/ui/scenes/AlphaTransition.vue';
import UnitSpawnAnimation from './UnitSpawnAnimation.vue';
import UnitStatBars from './UnitStatBars.vue';
import UnitVFX from './vfx/UnitVFX.vue';
import { GAME_PHASES } from '@game/engine/src/game/systems/game-phase.system';

const { unit } = defineProps<{ unit: UnitViewModel }>();

const camera = useIsoCamera();
const { state, gameType } = useGameState();
const player = useUserPlayer();

const isoPosition = useAnimatedIsoPoint({
  position: computed(() => unit.position)
});
const centerCamera = (buffer: number) => {
  const viewport = camera.viewport.value;
  if (!viewport) return;
  const position = {
    x: isoPosition.value.x + camera.offset.value.x,
    y: isoPosition.value.y + camera.offset.value.y
  };

  const isWithinViewport =
    position.x > viewport.left * (1 + buffer) &&
    position.x < viewport.right * (1 - buffer) &&
    position.y > viewport.top * (1 + buffer) &&
    position.y < viewport.bottom * (1 - buffer);

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
    await centerCamera(0.3);
  }
});

useBattleEvent(GAME_EVENTS.UNIT_START_TURN, async e => {
  if (
    gameType.value !== GAME_TYPES.LOCAL &&
    e.unit.playerId !== player.value.id
  ) {
    return;
  }
  if (unit.equals(e.unit)) {
    await centerCamera(1);
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
    <UnitVFX :unit="unit" />

    <AlphaTransition
      :duration="{ enter: 200, leave: 200 }"
      v-if="isSpawnAnimationDone"
    >
      <container>
        <ActiveUnitIndicator :unit="unit" />
        <UnitStatBars :unit="unit" v-if="state.phase === GAME_PHASES.BATTLE" />
        <!-- <HealthBar :unit="unit" :y="-45" :x="-20" />
        <ManaBar :unit="unit" :y="-40" :x="-20" /> -->
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
