<script setup lang="ts">
import UiAnimatedSprite from '@/ui/scenes/UiAnimatedSprite.vue';
import type { InteractableViewModel } from './interactable.model';

const { interactable } = defineProps<{
  interactable: InteractableViewModel;
}>();
</script>

<template>
  <container>
    <UiAnimatedSprite :assetId="interactable.spriteId" tag="idle" />
  </container>
</template>

<style scoped lang="postcss"></style>
