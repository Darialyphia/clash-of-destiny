<script setup lang="ts">
import { mapRange } from '@game/shared';
import type { UnitViewModel } from '../unit.model';
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';

const { unit } = defineProps<{ unit: UnitViewModel }>();

const mp = ref(unit.mp);
watch(
  () => unit.mp,
  () => {
    gsap.to(mp, { value: unit.mp, duration: 0.5 });
  }
);

const WIDTH = 50;
const HEIGHT = 5;
const ui = useBattleUiStore();
</script>

<template>
  <container :ref="(container: any) => ui.assignLayer(container, 'ui')">
    <graphics
      @render="
        g => {
          g.clear();
          g.beginFill(0x000000);
          g.drawRect(0, 0, WIDTH, HEIGHT);
          g.endFill();
          g.beginFill({
            h: 240,
            s: 85,
            l: 50
          });
          g.drawRect(0, 0, (WIDTH * mp) / unit.maxMp, HEIGHT);
          g.endFill();
        }
      "
    />
  </container>
</template>
