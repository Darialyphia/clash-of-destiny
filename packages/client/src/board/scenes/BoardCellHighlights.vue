<script setup lang="ts">
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';
import {
  useBattleStore,
  useGameState,
  useUserPlayer
} from '@/battle/stores/battle.store';
import { useIsoCamera } from '@/iso/composables/useIsoCamera';
import { useSettingsStore } from '@/shared/composables/useSettings';
import { pointToCellId } from '@game/engine/src/board/board-utils';
import type { SerializedCell } from '@game/engine/src/board/cell';
import { GAME_PHASES } from '@game/engine/src/game/systems/game-phase.system';
import { PTransition } from 'vue3-pixi';
import UiAnimatedSprite from '@/ui/scenes/UiAnimatedSprite.vue';
import type { CellViewModel } from '../cell.model';

const { cell } = defineProps<{ cell: CellViewModel }>();

const battleStore = useBattleStore();
const camera = useIsoCamera();
const ui = useBattleUiStore();
const { state } = useGameState();
const isWithinCardRange = computed(() => {
  return false;
});

const isHovered = computed(() => ui.hoveredCell?.id === cell.id);
const canTarget = computed(() => {
  return false;
});

const canMove = computed(() => {
  return (
    !!ui.selectedUnit && ui.selectedUnit.getMoveZone().some(c => c.equals(cell))
  );
});

const settingsStore = useSettingsStore();

const isOnPath = computed(() => {
  if (camera.isDragging.value) return false;
  if (!ui.selectedUnit) return false;
  if (!ui.hoveredCell) return false;
  if (!canMove.value) return false;

  return false;
  // const path = pathHelpers.getPathTo(ui.selectedUnit, ui.hoveredCell);

  // return path?.path.some(point => point.equals(cell));
});

const isInCardAoe = computed(() => {
  return false;
});
const userPlayer = useUserPlayer();

const tag = computed(() => {
  if (battleStore.isPlayingFx) {
    return null;
  }

  if (state.value.phase === GAME_PHASES.DEPLOY) {
    if (userPlayer.value.getDeployZone().some(c => c.equals(cell))) {
      return 'movement';
    }
  }

  return null;
});
</script>

<template>
  <PTransition
    appear
    :duration="{ enter: 200, leave: 200 }"
    :before-enter="{ alpha: 0 }"
    :enter="{ alpha: 1 }"
    :leave="{ alpha: 0 }"
  >
    <UiAnimatedSprite
      v-if="tag"
      assetId="tile-highlights"
      :tag="tag"
      :anchor="0.5"
    />
  </PTransition>
</template>
