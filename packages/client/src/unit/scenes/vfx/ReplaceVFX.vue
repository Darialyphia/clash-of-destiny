<script setup lang="ts">
import { useBattleEvent } from '@/battle/stores/battle.store';
import type { UnitViewModel } from '@/unit/unit.model';
import { GAME_EVENTS } from '@game/engine/src/game/game.events';
import { TextStyle } from 'pixi.js';
import { PTransition, EasePresets } from 'vue3-pixi';

const { unit } = defineProps<{ unit: UnitViewModel }>();

const isDisplayed = ref(false);
useBattleEvent(GAME_EVENTS.PLAYER_AFTER_RESOURCE_ACTION_REPLACE, async e => {
  if (!unit.isHero && !unit.isShrine) return;
  if (!unit.getPlayer().equals(e.player)) return;

  isDisplayed.value = true;
  setTimeout(() => {
    isDisplayed.value = false;
  }, 1500);
});

const textStyle = new TextStyle({
  fontSize: 30,
  fill: 'white',
  fontWeight: 'bolder',
  stroke: 'black',
  strokeThickness: 2
});
</script>

<template>
  <PTransition
    appear
    :duration="{ enter: 300, leave: 200 }"
    :before-enter="{ alpha: 0, y: 0 }"
    :enter="{ alpha: 1, y: -40, ease: EasePresets.easeOutCubic }"
    :leave="{
      y: -40,
      x: 10,
      alpha: 0,
      ease: EasePresets.easeOutCubic
    }"
  >
    <pixi-text :style="textStyle" v-if="isDisplayed" :x="-17" :scale="0.25">
      REPLACE
    </pixi-text>
  </PTransition>
</template>
