<script setup lang="ts">
import VirtualFloatingCard from '@/ui/scenes/VirtualFloatingCard.vue';
import type { ModifierViewModel } from '../modifier.model';
import { onTick } from 'vue3-pixi';
import { Container2d, AFFINE, TRANSFORM_STEP } from 'pixi-projection';
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';

const { modifier, index } = defineProps<{
  modifier: ModifierViewModel;
  index: number;
}>();

const isHovered = ref(false);

const container = shallowRef<Container2d>();
const cardPosition = ref({ x: 0, y: 0 });
onTick(() => {
  if (isHovered.value) {
    const pos = container.value!.toGlobal(
      container.value!.position,
      undefined,
      undefined
    );
    cardPosition.value = {
      x: pos.x - 40 + index * 10,
      y: pos.y - 50
    };
  }
});

const ui = useBattleUiStore();
</script>

<template>
  <container-2d
    v-if="modifier.icon"
    ref="container"
    :scale="0.5"
    :y="-14 + index * 10"
    :x="20"
    event-mode="static"
    @pointerenter="isHovered = true"
    @pointerleave="isHovered = false"
  >
    <sprite-2d
      :texture="`/assets/icons/${modifier.icon}.png`"
      :anchor="0.5"
      :ref="
        (container: any) => {
          if (!container) return;
          ui.assignLayer(container, 'ui');
          container.proj.affine = AFFINE.AXIS_X;
        }
      "
    >
      <outline-filter v-if="isHovered" :thickness="2" :color="0xffffff" />
    </sprite-2d>

    <text-2d
      v-if="modifier.stacks"
      :ref="
        (container: any) => {
          if (!container) return;
          ui.assignLayer(container, 'ui');
          container.proj.affine = AFFINE.AXIS_X;
        }
      "
      :style="{
        fontFamily: 'NotJamSlab14',
        align: 'center',
        fill: '#ffffff',
        fontSize: 56,
        strokeThickness: 8
      }"
      :scale="0.25"
      :y="-3"
      :x="5"
    >
      {{ modifier.stacks }}
    </text-2d>
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
  </container-2d>
</template>

<style scoped lang="postcss">
.tooltip {
  padding: var(--size-3);
  border-radius: var(--radius-2);
  color: white;
  background-color: black;
}
</style>
