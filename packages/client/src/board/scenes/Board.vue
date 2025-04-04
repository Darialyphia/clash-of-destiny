<script lang="ts" setup>
import BoardCell from '@/board/scenes/BoardCell.vue';
import { providePointLights } from '@/vfx/usePointLight';
import { useCells, useUnits } from '@/battle/stores/battle.store';
import { useIsoCamera } from '@/iso/composables/useIsoCamera';
import Unit from '@/unit/scenes/Unit.vue';
import { Point, Sprite, Texture } from 'pixi.js';
import { onTick, useApplication } from 'vue3-pixi';
import { AFFINE, Container2d, Sprite2d, TRANSFORM_STEP } from 'pixi-projection';
import BoardCellProj from './BoardCellProj.vue';
import UnitProj from '@/unit/scenes/UnitProj.vue';

const cells = useCells();
const units = useUnits();
const readyCells = ref(0);
const camera = useIsoCamera();
providePointLights(camera);

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

function snap(obj: any) {
  obj.position.x = Math.min(
    Math.max(obj.position.x, -app.value.screen.width / 2 + 10),
    app.value.screen.width / 2 - 10
  );
  obj.position.y = Math.min(
    Math.max(obj.position.y, -app.value.screen.height + 10),
    10
  );
}
function toggle(obj: any) {
  console.log(obj.factor);
  obj.factor = 1.0 - obj.factor;
  obj.tint = obj.factor ? 0xff0033 : 0x00ff00;
}
</script>

<template>
  <template v-if="camera.viewport.value">
    <!-- <BoardCell
      v-for="cell in cells"
      :key="cell.id"
      :cell
      @ready="readyCells++"
    />

    <template v-if="readyCells === cells.length">
      <Unit v-for="unit in units" :key="unit.id" :unit="unit" />
    </template> -->

    <!-- <AmbientLight :world-size="worldSize" /> -->

    <container-2d :position="[0, app.screen.height]" ref="container">
      <!-- <sprite-2d
        :texture="`/assets/ui/test-projection.png`"
        :anchor="[0.5, 1]"
        :width="app.screen.width * 0.75"
        :height="app.screen.height * 0.8"
        :y="-300"
      /> -->

      <container-2d
        :scale="2"
        :x="app.screen.width / 4"
        :y="-app.screen.height / 3"
      >
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
      :position="[app.screen.width / 2, -2000]"
    />
  </template>
</template>
