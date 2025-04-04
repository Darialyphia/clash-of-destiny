<script setup lang="ts">
import { useSpritesheet } from '@/shared/composables/useSpritesheet';
import { config } from '@/utils/config';
import type { CellViewModel } from '../cell.model';
import { createSpritesheetFrameObject } from '@/utils/sprite';
import {
  useBattleStore,
  useDispatcher,
  useGameState,
  useUserPlayer
} from '@/battle/stores/battle.store';
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';
import { INTERACTION_STATES } from '@game/engine/src/game/systems/interaction.system';
import { pointToCellId } from '@game/engine/src/board/board-utils';
import MoveIntentPathProj from './MoveIntentPathProj.vue';

const { cell } = defineProps<{ cell: CellViewModel }>();

const ui = useBattleUiStore();
const player = useUserPlayer();

const dispatch = useDispatcher();
const { state } = useGameState();
const battleStore = useBattleStore();
const isHovered = computed(() => ui.hoveredCell?.id === cell.id);

const sheet = useSpritesheet<'', string>('tile-highlights-proj');

const tag = computed(() =>
  ui.controller.getCellHighlightTag(
    cell,
    isHovered.value,
    battleStore.isPlayingFx
  )
);
const textures = computed(() => {
  if (!sheet.value) return null;
  return createSpritesheetFrameObject(
    tag.value ?? 'normal',
    sheet.value.sheets.base.base
  );
});
</script>

<template>
  <container-2d
    :position="[
      -config.TILE_SIZE_PROJ.x * cell.position.x,
      -config.TILE_SIZE_PROJ.y * cell.position.y
    ]"
    @pointerenter="
      () => {
        ui.hoverAt(cell.position);
        console.log('?');
        if (!ui.cardPlayIntent) return;

        const isTargetable =
          state.interactionState.state ===
            INTERACTION_STATES.SELECTING_TARGETS &&
          state.interactionState.ctx.elligibleTargets.some(target => {
            return pointToCellId(target.cell) === cell.id;
          });
        if (!isTargetable) return;

        dispatch({
          type: 'addNextTargetIntent',
          payload: {
            ...cell.position,
            playerId: player.id
          }
        });
      }
    "
    @pointerleave="ui.unHover()"
    @pointerup="
      () => {
        // if (camera.isDragging.value) return;
        ui.controller.onCellClick(cell);
      }
    "
  >
    <sprite-2d
      v-if="textures"
      :anchor="[0.5, 1]"
      :texture="textures[0].texture"
    />
    <MoveIntentPathProj :cell="cell" />
  </container-2d>
</template>
