<script setup lang="ts">
import { mapRange } from '@game/shared';
import type { UnitViewModel } from '../unit.model';
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';
import { Container } from 'pixi.js';

const { unit } = defineProps<{ unit: UnitViewModel }>();

const hp = ref(unit.hp);
watch(
  () => unit.hp,
  () => {
    gsap.to(hp, { value: unit.hp, duration: 0.5 });
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
            h: mapRange(hp, [0, unit.maxHp], [0, 110]),
            s: 100,
            l: 50
          });
          g.drawRect(0, 0, (WIDTH * hp) / unit.maxHp, HEIGHT);
          g.endFill();
        }
      "
    />
  </container>
</template>
