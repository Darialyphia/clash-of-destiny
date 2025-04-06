<script setup lang="ts">
import type { UnitViewModel } from '../unit.model';
import { useShaker } from '@/shared/composables/vfx/useShaker';
import type { Container } from 'pixi.js';
import { waitFor } from '@game/shared';
import { useBattleEvent, useGameState } from '@/battle/stores/battle.store';
import { GAME_EVENTS } from '@game/engine/src/game/game.events';

const { unit } = defineProps<{ unit: UnitViewModel }>();

const { state } = useGameState();
const scaleX = computed(() => {
  let value = unit.playerId === state.value.players[1] ? -1 : 1;

  return value;
});

const container = ref<Container>();
const shaker = useShaker(container);

useBattleEvent(GAME_EVENTS.UNIT_BEFORE_RECEIVE_DAMAGE, async e => {
  if (e.unit.id !== unit.id) return;
  const duration = 200;

  shaker.trigger({
    isBidirectional: false,
    shakeAmount: 10,
    shakeDelay: 35,
    shakeCountMax: Math.round(duration / 25)
  });

  await waitFor(duration);
});

useBattleEvent(GAME_EVENTS.UNIT_BEFORE_EVOLVE_HERO, async e => {
  if (e.unit.id !== unit.id) return;
  const duration = 1200;

  shaker.trigger({
    isBidirectional: false,
    shakeAmount: 10,
    shakeDelay: 35,
    shakeCountMax: Math.round(duration / 25)
  });

  await waitFor(duration);
});

useBattleEvent(GAME_EVENTS.UNIT_BEFORE_DESTROY, async e => {
  if (e.unit.id !== unit.id) return;
  await gsap.to(container.value!, {
    pixi: {
      y: 30,
      alpha: 0,
      ease: Power2.easeOut
    },
    duration: 1.2
  });
});
</script>

<template>
  <container :scale-x="scaleX" ref="container">
    <slot />
  </container>
</template>
