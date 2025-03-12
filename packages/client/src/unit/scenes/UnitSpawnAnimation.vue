<script setup lang="ts">
import type { Container } from 'pixi.js';
import { PTransition } from 'vue3-pixi';
import type { UnitViewModel } from '../unit.model';

const emit = defineEmits<{
  done: [];
}>();

const spawnAnimation = (container: Container) => {
  container.y = -40;
  container.alpha = 0;
  gsap.to(container, { alpha: 1, duration: 0.3 });
  gsap.to(container, {
    y: 0,
    duration: 1,
    ease: Bounce.easeOut,
    onComplete() {
      emit('done');
    }
  });
};
</script>

<template>
  <PTransition
    appear
    :duration="{ enter: 1000, leave: 0 }"
    @enter="spawnAnimation"
  >
    <slot />
  </PTransition>
</template>
