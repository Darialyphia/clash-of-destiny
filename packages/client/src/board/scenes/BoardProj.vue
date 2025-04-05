<script lang="ts" setup>
import { useCells, useUnits } from '@/battle/stores/battle.store';
import { Sprite, Texture } from 'pixi.js';
import { onTick, useApplication } from 'vue3-pixi';
import { Container2d, TRANSFORM_STEP } from 'pixi-projection';
import BoardCellProj from './BoardCellProj.vue';
import UnitProj from '@/unit/scenes/UnitProj.vue';

const cells = useCells();
const units = useUnits();
const readyCells = ref(0);

const bigWhiteTexture = new Texture(Texture.WHITE.baseTexture);
bigWhiteTexture.orig.width = 30;
bigWhiteTexture.orig.height = 30;

const app = useApplication();

const container = ref<Container2d>();
const squareFar = ref<Sprite>();
onTick(() => {
  const pos = container.value!.toLocal(
    squareFar.value!.position,
    undefined,
    undefined,
    undefined,
    TRANSFORM_STEP.BEFORE_PROJ
  );
  // need to invert this thing, otherwise we'll have to use scale.y=-1 which is not good
  pos.y = -pos.y;
  pos.x = -pos.x;
  container.value!.proj.setAxisY(pos, -1);
});
</script>

<template>
  <container-2d :position="[0, 400]" ref="container">
    <container-2d :scale="2" :x="app.screen.width / 4" :y="-250">
      <BoardCellProj
        v-for="cell in cells"
        :key="cell.id"
        :cell
        @ready="readyCells++"
      />

      <UnitProj v-for="unit in units" :key="unit.id" :unit="unit" />
    </container-2d>
  </container-2d>

  <Sprite
    ref="squareFar"
    :texture="bigWhiteTexture"
    :tint="0xff0000"
    :factor="1"
    :anchor="0.5"
    :position="[app.screen.width / 2, -2400]"
  />
</template>
