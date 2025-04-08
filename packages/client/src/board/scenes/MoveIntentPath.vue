<script setup lang="ts">
import type { CellViewModel } from '../cell.model';
import UiAnimatedSprite from '@/ui/scenes/UiAnimatedSprite.vue';
import { useIsoCamera } from '@/iso/composables/useIsoCamera';
import { pointToCellId } from '@game/engine/src/board/board-utils';
import { isDefined } from '@game/shared';
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';

const { cell } = defineProps<{ cell: CellViewModel }>();

const ui = useBattleUiStore();

const path = computed(() => {
  if (!ui.selectedUnit?.moveIntent) return null;
  return [ui.selectedUnit.position, ...ui.selectedUnit.moveIntent.path];
});

const positionInPath = computed(() => {
  if (!path.value) return -1;
  return path.value.findIndex(point => pointToCellId(point) === cell.id);
});

const assetId = computed(() => {
  if (!path.value) return;
  if (positionInPath.value === 0) {
    return 'path-start';
  } else if (positionInPath.value === path.value.length - 1) {
    return 'path-end';
  } else {
    const nextStep = path.value[positionInPath.value + 1];
    const prevStep = path.value[positionInPath.value - 1];

    const isStraight = nextStep.x === prevStep.x || nextStep.y === prevStep.y;
    return isStraight ? 'path-straight' : 'path-turn';
  }
});

const tag = computed(() => {
  if (!path.value) return;
  if (positionInPath.value === -1) return;

  const step = path.value[positionInPath.value];
  const nextStep = path.value[positionInPath.value + 1];
  const prevStep = path.value[positionInPath.value - 1];

  let tag = 0;

  if (!isDefined(prevStep)) {
    if (nextStep.x > step.x) {
      tag = 0;
    } else if (nextStep.x < step.x) {
      tag = 2;
    } else if (nextStep.y > step.y) {
      tag = 1;
    } else if (nextStep.y < step.y) {
      tag = 3;
    }
  } else {
    const isStraight =
      !isDefined(nextStep) ||
      nextStep.x === prevStep.x ||
      nextStep.y === prevStep.y;
    if (isStraight) {
      if (prevStep.x < step.x) {
        tag = 0;
      } else if (prevStep.x > step.x) {
        tag = 2;
      } else if (prevStep.y < step.y) {
        tag = 1;
      } else if (prevStep.y > step.y) {
        tag = 3;
      }
    } else {
      const isHorizontal = step.y === prevStep.y;
      const isVertical = step.x === prevStep.x;

      if (
        (isHorizontal && prevStep.x < nextStep.x && prevStep.y < nextStep.y) ||
        (isVertical && nextStep.x < prevStep.x && nextStep.y < prevStep.y)
      ) {
        tag = 0;
      } else if (
        (isHorizontal && prevStep.x < nextStep.x && prevStep.y > nextStep.y) ||
        (isVertical && nextStep.x < prevStep.x && nextStep.y > prevStep.y)
      ) {
        tag = 1;
      } else if (
        (isHorizontal && prevStep.x > nextStep.x && prevStep.y > nextStep.y) ||
        (isVertical && nextStep.x > prevStep.x && nextStep.y > prevStep.y)
      ) {
        tag = 2;
      } else if (
        (isHorizontal && prevStep.x > nextStep.x && prevStep.y < nextStep.y) ||
        (isVertical && nextStep.x > prevStep.x && nextStep.y < prevStep.y)
      ) {
        tag = 3;
      }
    }
  }

  const rotation = camera.angle.value / 90;
  return String((tag + rotation) % 4);
});

const camera = useIsoCamera();
</script>

<template>
  <UiAnimatedSprite
    v-if="positionInPath >= 0 && assetId && tag"
    :asset-id="assetId"
    :tag="tag"
  />
</template>
