<script setup lang="ts">
import type { UnitViewModel } from '../unit.model';
import VirtualFloatingCard from '@/ui/scenes/VirtualFloatingCard.vue';
import type { ModifierViewModel } from '../modifier.model';
import { useIsoCamera } from '@/iso/composables/useIsoCamera';
import { useIsoPoint } from '@/iso/composables/useIsoPoint';

const { modifier, unit, index } = defineProps<{
  unit: UnitViewModel;
  modifier: ModifierViewModel;
  index: number;
}>();

const isHovered = ref(false);
const camera = useIsoCamera();

const { isoPosition } = useIsoPoint({
  position: computed(() => modifier.targetAsUnit.position)
});

const cardPosition = computed(() =>
  camera.viewport.value?.toScreen({
    x: isoPosition.value.x + camera.offset.value.x - 40 + index * 10,
    y: isoPosition.value.y + camera.offset.value.y - 50
  })
);

const outlineThickness = ref(camera.viewport.value!.scale.x);
camera.viewport.value?.on('zoomed-end', () => {
  outlineThickness.value = camera.viewport.value!.scale.x;
});
</script>

<template>
  <container
    v-if="modifier.icon"
    :scale="0.5"
    :y="-32"
    :x="-28 + index * 10"
    event-mode="static"
    @pointerenter="isHovered = true"
    @pointerleave="isHovered = false"
  >
    <sprite :texture="`/assets/icons/${modifier.icon}.png`" :anchor="0.5">
      <outline-filter
        v-if="isHovered"
        :thickness="outlineThickness"
        :color="0xffffff"
      />
    </sprite>
    <VirtualFloatingCard
      :position="cardPosition!"
      :timeout="500"
      :is-opened="!!cardPosition && isHovered"
    >
      <div class="tooltip">
        <div class="text-1 text-bold">{{ modifier.name }}</div>
        <p class="text-0 max-inline-xs">{{ modifier.description }}</p>
      </div>
    </VirtualFloatingCard>
    <!-- <sprite
      :texture="`/assets/icons/keyword-frame-${modifier.sourcePlayer.getPlayer().isAlly(userPlayer.getPlayer()) ? 'positive' : 'negative'}.png`"
      :anchor="0.5"
    /> -->
  </container>
</template>

<style scoped lang="postcss">
.tooltip {
  padding: var(--size-3);
  border-radius: var(--radius-2);
  color: white;
  background-color: black;
}
</style>
