<script setup lang="ts">
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';
import {
  useActiveUnit,
  useBattleStore,
  useGameState,
  useUserPlayer
} from '@/battle/stores/battle.store';
import { useIsoCamera } from '@/iso/composables/useIsoCamera';
import { useSettingsStore } from '@/shared/composables/useSettings';
import { GAME_PHASES } from '@game/engine/src/game/systems/game-phase.system';
import { PTransition } from 'vue3-pixi';
import UiAnimatedSprite from '@/ui/scenes/UiAnimatedSprite.vue';
import type { CellViewModel } from '../cell.model';
import { pointToCellId } from '@game/engine/src/board/board-utils';

const { cell } = defineProps<{ cell: CellViewModel }>();

const battleStore = useBattleStore();
const camera = useIsoCamera();
const ui = useBattleUiStore();
const { state } = useGameState();
const activeUnit = useActiveUnit();

const isWithinCardRange = computed(() => {
  return false;
});

const isHovered = computed(() => ui.hoveredCell?.id === cell.id);
const canTarget = computed(() => {
  return false;
});

const settingsStore = useSettingsStore();

const isInCardAoe = computed(() => {
  return false;
});
const userPlayer = useUserPlayer();

const tag = computed(() => {
  return ui.controller.getCellHighlightTag(
    cell,
    isHovered.value,
    battleStore.isPlayingFx
  );
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
