<script setup lang="ts">
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';
import type { UnitViewModel } from '../unit.model';
import { AFFINE } from 'pixi-projection';

const { unit } = defineProps<{ unit: UnitViewModel }>();

const ui = useBattleUiStore();
</script>

<template>
  <container-2d
    :x="-28"
    :y="20"
    :ref="
      (container: any) => {
        if (!container) return;
        ui.assignLayer(container, 'ui');
        container.proj.affine = AFFINE.AXIS_X;
      }
    "
  >
    <sprite-2d
      texture="/assets/ui/unit-stats-attack.png"
      v-if="unit.isHero || unit.isMinion"
    >
      <pixi-text
        :style="{
          fontFamily: 'NotJamSlab14',
          align: 'center',
          fill: '#ffe900',
          fontSize: 42,
          strokeThickness: 8
        }"
        :anchor="0.5"
        :scale="0.25"
        :x="8"
        :y="8"
      >
        {{ unit.atk }}
      </pixi-text>
    </sprite-2d>
    <sprite-2d
      texture="/assets/ui/unit-stats-spellpower.png"
      :y="-18"
      v-if="unit.isHero"
    >
      <pixi-text
        :style="{
          fontFamily: 'NotJamSlab14',
          align: 'center',
          fill: '#00bcff',
          fontSize: 42,
          strokeThickness: 8
        }"
        :anchor="0.5"
        :scale="0.25"
        :x="8"
        :y="8"
      >
        {{ unit.spellpower }}
      </pixi-text>
    </sprite-2d>
    <sprite-2d texture="/assets/ui/unit-stats-hp.png" :x="40">
      <pixi-text
        :style="{
          fontFamily: 'NotJamSlab14',
          align: 'center',
          fill: '#ff134b',
          fontSize: 42,
          strokeThickness: 8
        }"
        :anchor="0.5"
        :scale="0.25"
        :x="8"
        :y="8"
      >
        {{ unit.hp }}
      </pixi-text>
    </sprite-2d>
  </container-2d>
</template>

<style scoped lang="postcss"></style>
