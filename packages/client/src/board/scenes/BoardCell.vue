<script setup lang="ts">
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';
import BoardCellSprite from '@/board/scenes/BoardCellSprite.vue';
import AnimatedIsoPoint from '@/iso/components/AnimatedIsoPoint.vue';
import BoardCellHighlights from './BoardCellHighlights.vue';
import { PTransition, type ContainerInst } from 'vue3-pixi';
import type { CellViewModel } from '../cell.model';
import { useActiveUnit, useUserPlayer } from '@/battle/stores/battle.store';
import HoveredCellIndicator from './HoveredCellIndicator.vue';
import { pointToCellId } from '@game/engine/src/board/board-utils';
import { config } from '@/utils/config';
import UnitOrientation from '@/unit/scenes/UnitOrientation.vue';
import UnitSprite from '@/unit/scenes/UnitSprite.vue';
import MoveIntentPath from './MoveIntentPath.vue';
import { useIsoCamera } from '@/iso/composables/useIsoCamera';
import Interactable from '@/interactable/Interactable.vue';

const { cell } = defineProps<{ cell: CellViewModel }>();

const ui = useBattleUiStore();
const isHovered = computed(() => ui.hoveredCell?.id === cell.id);

const emit = defineEmits<{ ready: [] }>();
const isSpawnAnimationDone = ref(false);

const spawnAnimation = (container: ContainerInst) => {
  container.y = -400;
  container.alpha = 0;

  gsap.to(container, {
    y: 0,
    duration: 1,
    ease: Bounce.easeOut,
    delay: Math.random() * 0.5,
    onStart() {
      container.alpha = 1;
    },
    onComplete() {
      isSpawnAnimationDone.value = true;
      emit('ready');
    }
  });
};

const activeUnit = useActiveUnit();
const isActiveUnitMoveIntent = computed(() => {
  return activeUnit.value.moveIntent
    ? pointToCellId(activeUnit.value.moveIntent.point) === cell.id
    : false;
});

const camera = useIsoCamera();
</script>

<template>
  <AnimatedIsoPoint
    :position="cell.position"
    @pointerenter="ui.hoverAt(cell.position)"
    @pointerleave="ui.unHover()"
    @pointerup="
      () => {
        if (camera.isDragging.value) return;
        ui.controller.onCellClick(cell);
      }
    "
  >
    <PTransition
      appear
      :duration="{ enter: 1000, leave: 0 }"
      @enter="spawnAnimation"
    >
      <container :ref="(container: any) => ui.assignLayer(container, 'scene')">
        <BoardCellSprite :cell="cell" />
        <BoardCellHighlights :cell="cell" v-if="isSpawnAnimationDone" />
        <MoveIntentPath :cell="cell" />
        <HoveredCellIndicator v-if="isHovered && isSpawnAnimationDone" />
        <Interactable
          v-if="cell.getInteractable()"
          :y="-24"
          :interactable="cell.getInteractable()!"
        />
        <container
          v-if="isActiveUnitMoveIntent"
          :position="config.UNIT_SPRITE_OFFSET"
        >
          <UnitOrientation :unit="activeUnit">
            <UnitSprite :unit="activeUnit" />
          </UnitOrientation>
        </container>
      </container>
    </PTransition>
  </AnimatedIsoPoint>
</template>
