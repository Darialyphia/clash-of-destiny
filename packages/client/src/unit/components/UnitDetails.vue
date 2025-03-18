<script setup lang="ts">
import type { UnitViewModel } from '../unit.model';

const { unit } = defineProps<{ unit: UnitViewModel }>();
</script>

<template>
  <div class="unit-details"></div>
</template>

<style scoped lang="postcss">
.unit-details {
  background-color: #32021b;
  border: solid 6px #efef9f;
  border-bottom-color: #d7ad42;
  border-right-color: transparent;
  height: 100%;
}
</style>
