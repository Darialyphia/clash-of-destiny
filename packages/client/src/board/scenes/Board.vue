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
const squarePlane = ref<Sprite2d>();
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
  // @ts-expect-error pixi-projection typing error
  container.value!.proj.setAxisY(pos, -squareFar.value!.factor);
  // @ts-expect-error pixi-projection typing error
  squarePlane.value!.proj.affine = squarePlane.value.factor
    ? AFFINE.AXIS_X
    : AFFINE.NONE;
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

    <container-2d
      :position="[app.screen.width / 2, app.screen.height]"
      ref="container"
    >
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
      </container-2d>

      <sprite-2d
        :texture="bigWhiteTexture"
        :tint="0xff0000"
        :factor="1"
        :anchor="[0.5, 0]"
        :position="[-app.screen.width / 4, -app.screen.height / 2]"
        :ref="
          (el: any) => {
            if (!el) return;
            squarePlane = el;
            el.proj.affine = AFFINE.AXIS_X;
          }
        "
        @pointerdown="
          (event: any) => {
            const obj = event.currentTarget;
            obj.dragData = event.data;
            obj.dragging = 1;
            obj.dragPointerStart = event.data.getLocalPosition(obj.parent);
            obj.dragObjStart = new Point();
            obj.dragObjStart.copyFrom(obj.position);
            obj.dragGlobalStart = new Point();
            obj.dragGlobalStart.copyFrom(event.data.global);
            event.stopPropagation();
          }
        "
        @pointerup="
          (event: any) => {
            const obj = event.currentTarget;
            if (!obj.dragging) return;
            if (obj.dragging === 1) {
              toggle(obj);
            } else {
              snap(obj);
            }

            obj.dragging = 0;
            obj.dragData = null;

            event.stopPropagation();
          }
        "
        @pointermove="
          (event: any) => {
            const obj = event.currentTarget;
            if (!obj.dragging) return;
            event.stopPropagation();
            const data = obj.dragData; // it can be different pointer!
            if (obj.dragging === 1) {
              // click or drag?
              if (
                Math.abs(data.global.x - obj.dragGlobalStart.x) +
                  Math.abs(data.global.y - obj.dragGlobalStart.y) >=
                3
              ) {
                // DRAG
                obj.dragging = 2;
              }
            }
            if (obj.dragging === 2) {
              const dragPointerEnd = data.getLocalPosition(obj.parent);
              // DRAG
              obj.position.set(
                obj.dragObjStart.x +
                  (dragPointerEnd.x - obj.dragPointerStart.x),
                obj.dragObjStart.y + (dragPointerEnd.y - obj.dragPointerStart.y)
              );
            }
          }
        "
      >
        <sprite-2d
          texture="https://pixijs.io/examples/examples/assets/bunny.png"
          :anchor="0.5"
          :scale="3"
          :y="-50"
        />
      </sprite-2d>
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
