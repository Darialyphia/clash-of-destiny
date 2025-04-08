<script setup lang="ts">
import UnitOrientation from './UnitOrientation.vue';
import UnitSprite from './UnitSprite.vue';
import UnitShadow from './UnitShadow.vue';
import UnitPositioner from './UnitPositioner.vue';
import type { UnitViewModel } from '../unit.model';
import AlphaTransition from '@/ui/scenes/AlphaTransition.vue';
import UnitSpawnAnimation from './UnitSpawnAnimation.vue';
import UnitVFX from './vfx/UnitVFX.vue';
import UnitModifierSprite from './UnitModifierSprite.vue';

const { unit } = defineProps<{ unit: UnitViewModel }>();

const isSpawnAnimationDone = ref(false);
</script>

<template>
  <UnitPositioner :unit="unit" v-if="!unit.isDead">
    <UnitSpawnAnimation :unit="unit" @done="isSpawnAnimationDone = true">
      <UnitOrientation :unit="unit">
        <UnitShadow :unit="unit" />
        <UnitSprite :unit="unit" />
      </UnitOrientation>
    </UnitSpawnAnimation>
    <UnitVFX :unit="unit" />

    <AlphaTransition
      :duration="{ enter: 200, leave: 200 }"
      v-if="isSpawnAnimationDone"
    >
      <container>
        <UnitModifierSprite
          v-for="(modifier, index) in unit.getModifiers()"
          :unit="unit"
          :key="modifier.id"
          :modifier="modifier"
          :index="index"
        />
      </container>
    </AlphaTransition>
  </UnitPositioner>
</template>
