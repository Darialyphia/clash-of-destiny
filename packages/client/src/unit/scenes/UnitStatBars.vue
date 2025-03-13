<script setup lang="ts">
import { clamp } from '@game/shared';
import type { UnitViewModel } from '../unit.model';
import { useSpritesheet } from '@/shared/composables/useSpritesheet';
import UiAnimatedSprite from '@/ui/scenes/UiAnimatedSprite.vue';
import UiLayerContainer from '@/ui/scenes/UiLayerContainer.vue';
import type { GraphicsInst } from 'vue3-pixi';
import { useBattleEvent } from '@/battle/stores/battle.store';
import { GAME_EVENTS } from '@game/engine/src/game/game.events';

const { unit } = defineProps<{ unit: UnitViewModel }>();

const hp = ref(unit.hp);
watch(
  () => unit.hp,
  () => {
    const duration = Math.abs(unit.hp - hp.value) * 0.1;
    gsap.to(hp, { value: unit.hp, duration });
  }
);

useBattleEvent(GAME_EVENTS.UNIT_BEFORE_RECEIVE_DAMAGE, async event => {
  if (event.unit.id === unit.id) {
    const duration = Math.abs(hp.value - event.damage) * 0.1;
    gsap.to(hp, { value: event.unit.hp, duration });
  }
});
useBattleEvent(GAME_EVENTS.UNIT_BEFORE_RECEIVE_HEAL, async event => {
  if (event.unit.id === unit.id) {
    const duration = Math.abs(hp.value + event.amount) * 0.1;
    gsap.to(hp, { value: event.unit.hp, duration });
  }
});

const mp = ref(unit.mp);
watch(
  () => unit.mp,
  () => {
    const duration = Math.abs(unit.hp - hp.value) * 0.1;
    gsap.to(mp, { value: unit.mp, duration });
  }
);

const exp = ref(unit.exp);
watch(
  () => unit.exp,
  () => {
    const duration = Math.abs(unit.hp - hp.value) * 0.1;
    gsap.to(exp, { value: unit.exp, duration });
  }
);

const tag = computed(() => {
  if (unit.isMaxLevel) return 'max-level';
  if (unit.canLevelUp) return 'ready';
  return 'idle';
});

const spriteSheets = useSpritesheet('unit-stat-bars');
const sheet = computed(() => spriteSheets.value?.sheets.base.base!);

const mask = ref<GraphicsInst>();
</script>

<template>
  <UiLayerContainer v-if="sheet">
    <container :y="unit.isMaxLevel ? -45 : -55">
      <UiAnimatedSprite asset-id="unit-stat-bars" :tag="tag" :mask="mask" />

      <graphics
        :x="-40"
        :y="-28"
        ref="mask"
        :alpha="0.75"
        @render="
          g => {
            const slices = [
              [
                sheet.data.meta.slices?.find(
                  atbSlice => atbSlice.name === 'hp'
                ),
                hp,
                unit.maxHp
              ] as const,
              [
                sheet.data.meta.slices?.find(
                  atbSlice => atbSlice.name === 'mp'
                ),
                mp,
                unit.maxMp
              ] as const,
              [
                sheet.data.meta.slices?.find(
                  atbSlice => atbSlice.name === 'exp'
                ),
                exp,
                unit.expToNextLevel
              ] as const
            ];
            g.clear();
            g.beginFill(0x665555);
            g.drawRect(0, 0, 80, 55);
            g.endFill();
            g.beginHole();
            slices.forEach(([slice, stat, max]) => {
              if (!slice) return;
              const { bounds } = slice.keys[0];
              const xOffset = clamp(
                Math.round(bounds.w * (stat / max)),
                0,
                bounds.w
              );
              if (Number.isNaN(xOffset)) return;

              g.drawRect(
                bounds.x + xOffset,
                bounds.y,
                bounds.w - xOffset,
                bounds.h + 1 // deals with rendering artifacts
              );
            });
            g.endHole();
          }
        "
      />
      <UiAnimatedSprite
        v-if="unit.canLevelUp"
        asset-id="unit-stat-bars"
        tag="ready"
        layer="fx"
      />
    </container>
  </UiLayerContainer>
</template>
