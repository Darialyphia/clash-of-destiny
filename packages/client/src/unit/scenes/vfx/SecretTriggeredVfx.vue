<script setup lang="ts">
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';
import { useBattleEvent } from '@/battle/stores/battle.store';
import type { UnitViewModel } from '@/unit/unit.model';
import { GAME_EVENTS } from '@game/engine/src/game/game.events';
import { waitFor } from '@game/shared';
import { Sprite2d, AFFINE } from 'pixi-projection';
import { PTransition, EasePresets } from 'vue3-pixi';

const { unit } = defineProps<{ unit: UnitViewModel }>();

const ui = useBattleUiStore();

useBattleEvent(GAME_EVENTS.PLAYER_BEFORE_TRIGGER_SECRET, async e => {
  if (!unit.isHero && !unit.isShrine) return;
  if (!unit.getPlayer().equals(e.player)) return;

  isDisplayed.value = true;
  await waitFor(1500);
  isDisplayed.value = false;
});
const isDisplayed = ref(false);
</script>

<template>
  <PTransition
    appear
    :duration="{ enter: 300, leave: 200 }"
    :before-enter="{ alpha: 0, y: 0 - 20 }"
    :enter="{ alpha: 1, y: -45, ease: EasePresets.easeOutCubic }"
    :leave="{
      alpha: 0,
      ease: EasePresets.easeOutCubic
    }"
  >
    <sprite-2d
      v-if="isDisplayed"
      :y="-45"
      :ref="
        (container: any) => {
          if (container) {
            (container as Sprite2d).proj.affine = AFFINE.AXIS_X;
            ui.assignLayer(container, 'ui');
          }
        }
      "
      texture="/assets/ui/secret-triggered.png"
      :anchor="0.5"
    />
  </PTransition>
</template>
