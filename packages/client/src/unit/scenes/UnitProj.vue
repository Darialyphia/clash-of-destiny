<script setup lang="ts">
import UnitOrientation from './UnitOrientation.vue';
import UnitSprite from './UnitSprite.vue';
import UnitShadowProj from './UnitShadowProj.vue';
import UnitPositioner from './UnitPositioner.vue';
import type { UnitViewModel } from '../unit.model';
import AlphaTransition from '@/ui/scenes/AlphaTransition.vue';
import UnitSpawnAnimation from './UnitSpawnAnimation.vue';
import UnitVFX from './vfx/UnitVFX.vue';
import UnitModifierSprite from './UnitModifierSprite.vue';
import UnitPositionerProj from './UnitPositionerProj.vue';
import UnitOrientationProj from './UnitOrientationProj.vue';
import UnitSpriteProj from './UnitSpriteProj.vue';
import UnitStats from './UnitStats.vue';
import { isDefined } from '@game/shared';

const { unit } = defineProps<{ unit: UnitViewModel }>();

const isSpawnAnimationDone = ref(false);
const modifiers = computed(() =>
  unit.getModifiers().filter(modifier => isDefined(modifier) && modifier.icon)
);
</script>

<template>
  <UnitPositionerProj :unit="unit" v-if="!unit.isDead">
    <UnitSpawnAnimation :unit="unit" @done="isSpawnAnimationDone = true">
      <UnitOrientationProj :unit="unit">
        <UnitShadowProj :unit="unit" />
        <UnitSpriteProj :unit="unit" />
      </UnitOrientationProj>
    </UnitSpawnAnimation>
    <UnitVFX :unit="unit" />

    <AlphaTransition
      :duration="{ enter: 200, leave: 200 }"
      v-if="isSpawnAnimationDone"
    >
      <container>
        <UnitModifierSprite
          v-for="(modifier, index) in modifiers"
          :key="modifier.id"
          :modifier="modifier"
          :index="index"
        />
        <UnitStats :unit="unit" />
      </container>
    </AlphaTransition>
  </UnitPositionerProj>
</template>
