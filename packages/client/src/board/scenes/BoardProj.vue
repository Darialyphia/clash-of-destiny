<script lang="ts" setup>
import {
  useBattleEvent,
  useBattleStore,
  useCells,
  useGameState,
  usePlayers,
  useUnits
} from '@/battle/stores/battle.store';
import { Point, Sprite, Texture } from 'pixi.js';
import { onTick, useApplication } from 'vue3-pixi';
import { Container2d, TRANSFORM_STEP } from 'pixi-projection';
import BoardCellProj from './BoardCellProj.vue';
import UnitProj from '@/unit/scenes/UnitProj.vue';
import Deck from '@/card/scenes/Deck.vue';
import { config } from '@/utils/config';
import { useWindowSize } from '@vueuse/core';
import { useShockwave } from '@/ui/composables/use-shockwave';
import { GAME_EVENTS } from '@game/engine/src/game/game.events';
import { UnitViewModel } from '@/unit/unit.model';
import { waitFor } from '@game/shared';

const cells = useCells();
const units = useUnits();
const readyCells = ref(0);
const { state } = useGameState();

const bigWhiteTexture = new Texture(Texture.WHITE.baseTexture);
bigWhiteTexture.orig.width = 30;
bigWhiteTexture.orig.height = 30;

const app = useApplication();

const container = shallowRef<Container2d>();
const squareFar = shallowRef<Sprite>();
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

const screenHeight = ref(app.value.screen.height);
const screenWidth = ref(app.value.screen.width);
onTick(() => {
  screenHeight.value = app.value.screen.height;
  screenWidth.value = app.value.screen.width;
});
const boardWidth =
  config.TILE_SIZE_PROJ.x * state.value.board.columns * config.INITIAL_ZOOM;
const { width, height } = useWindowSize();
const offsetX = computed(() => {
  return (width.value - boardWidth) / 2;
});

const shockwave = useShockwave(container);
useBattleEvent(GAME_EVENTS.UNIT_BEFORE_EVOLVE_HERO, async e => {
  const viewModel = units.value.find(u => u.id === e.unit.id);
  if (!viewModel) return;

  await shockwave.trigger({
    duration: 700,
    radius: 1000,
    speed: 600,
    wavelength: 150,
    offset: new Point(
      viewModel.position.x * config.TILE_SIZE_PROJ.x + offsetX.value / 2,
      viewModel.position.y * config.TILE_SIZE_PROJ.y + 100
    )
  });
});
const battleStore = useBattleStore();
useBattleEvent(GAME_EVENTS.UNIT_CREATED, async event => {
  if (event.unit.isHero) return;

  const state = battleStore.state!;
  const vm = new UnitViewModel(
    event.unit,
    state.entities,
    battleStore.dispatch
  );
  state.entities[event.unit.id] = vm;
  state.units.push(vm.id);
  await waitFor(1000);
});

const displayedUnits = computed(() => {
  return units.value.filter(u => !u.isDead);
});
</script>

<template>
  <sprite
    texture="/assets/backgrounds/battle-bg2.png"
    :anchor="0.5"
    :x="screenWidth / 2"
    :y="screenHeight / 2 - 50"
    :scale="1.25"
  />
  <container-2d :position="[0, screenHeight * 0.45]" ref="container">
    <container-2d
      :scale="config.INITIAL_ZOOM"
      :x="offsetX + 80"
      :y="-200"
      :sortable-children="true"
    >
      <BoardCellProj
        v-for="cell in cells"
        :key="cell.id"
        :cell
        @ready="readyCells++"
      />

      <UnitProj v-for="unit in displayedUnits" :key="unit.id" :unit="unit" />
      <!-- <Deck :x="-150" :y="200" :scale="0.35" :player="players[0]" /> -->
    </container-2d>
  </container-2d>

  <Sprite
    ref="squareFar"
    :texture="bigWhiteTexture"
    :tint="0xff0000"
    :factor="1"
    :anchor="0.5"
    :position="[screenWidth / 2, -2800]"
  />
</template>
