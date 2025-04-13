<script setup lang="ts">
import type { UnitViewModel } from '@/unit/unit.model';
import DamageIndicator from './DamageIndicator.vue';
import ReplaceVFX from './ReplaceVFX.vue';
// import LightVFX from './LightVFX.vue';

const { unit } = defineProps<{ unit: UnitViewModel }>();
</script>

<template>
  <container>
    <DamageIndicator :unit="unit" />
    <ReplaceVFX :unit="unit" />
    <!-- <LightVFX :unit="unit" /> -->
  </container>
</template>
