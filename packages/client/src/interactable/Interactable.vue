<script setup lang="ts">
import UiAnimatedSprite from '@/ui/scenes/UiAnimatedSprite.vue';
import type { InteractableViewModel } from './interactable.model';
import { useIsoCamera } from '@/iso/composables/useIsoCamera';
import { useIsoPoint } from '@/iso/composables/useIsoPoint';
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';
import VirtualFloatingCard from '@/ui/scenes/VirtualFloatingCard.vue';

const { interactable } = defineProps<{
  interactable: InteractableViewModel;
}>();

const camera = useIsoCamera();

const { isoPosition } = useIsoPoint({
  position: computed(() => interactable.position)
});

const position = computed(() =>
  camera.viewport.value?.toScreen({
    x: isoPosition.value.x + camera.offset.value.x - 40,
    y: isoPosition.value.y + camera.offset.value.y - 50
  })
);

const ui = useBattleUiStore();
const isHovered = computed(
  () => ui.hoveredCell?.getInteractable()?.equals(interactable) ?? false
);

const outlineThickness = ref(camera.viewport.value!.scale.x);
camera.viewport.value?.on('zoomed-end', () => {
  outlineThickness.value = camera.viewport.value!.scale.x;
});
</script>

<template>
  <container>
    <UiAnimatedSprite :assetId="interactable.spriteId" tag="idle">
      <outline-filter
        v-if="isHovered"
        :thickness="outlineThickness"
        :color="0xffffff"
      />
    </UiAnimatedSprite>
    <VirtualFloatingCard
      :position="position!"
      :timeout="500"
      :is-opened="!!position && isHovered"
    >
      <div class="tooltip">
        <img :src="interactable.imagePath" />
        <div>
          <div class="text-1 text-bold mb-2">{{ interactable.name }}</div>
          <p class="text-0">{{ interactable.description }}</p>
        </div>
      </div>
    </VirtualFloatingCard>
  </container>
</template>

<style scoped lang="postcss">
.tooltip {
  max-width: 40ch;
  background-color: black;
  backdrop-filter: blur(5px);
  padding: var(--size-3);
  color: white;
  display: flex;
  gap: var(--size-3);
  border-radius: var(--radius-2);
}
img {
  aspect-ratio: 1;
  flex-grow: 1;
}
</style>
