<script setup lang="ts">
import { useSpritesheet } from '@/shared/composables/useSpritesheet';
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';
import { OutlineFilter } from '@pixi/filter-outline';
import { AdjustmentFilter } from '@pixi/filter-adjustment';
import { useMultiLayerTexture } from '@/shared/composables/useMultiLayerTexture';
import { config } from '@/utils/config';
import type { UnitViewModel } from '../unit.model';
import { useGameState, useUserPlayer } from '@/battle/stores/battle.store';
import { INTERACTION_STATES } from '@game/engine/src/game/systems/interaction.system';
import { pointToCellId } from '@game/engine/src/board/board-utils';
import { Sprite2d, AFFINE } from 'pixi-projection';

const { unit, hasFilters = true } = defineProps<{
  unit: UnitViewModel;
  hasFilters?: boolean;
}>();

const sheet = useSpritesheet<'', 'base' | 'destroyed'>(() => unit.spriteId);
const ui = useBattleUiStore();
const { state } = useGameState();
const player = useUserPlayer();

const outlineThickness = ref(2);

const textures = useMultiLayerTexture({
  sheet,
  parts: () => unit.spriteParts,
  tag: 'idle',
  dimensions: config.UNIT_SPRITE_SIZE
});

const isInAoe = computed(() => {
  if (
    state.value.interactionState.state !== INTERACTION_STATES.SELECTING_TARGETS
  ) {
    return false;
  }

  const card = player.value.getCurrentlyPlayedCard();
  if (!card) return false;
  if (!ui.hoveredCell) return false;
  const canPlay = state.value.interactionState.ctx.elligibleTargets.some(
    cell => pointToCellId(cell.cell) === ui.hoveredCell!.id
  );
  if (!canPlay) return false;
  const aoe = card.getAoe();
  return aoe.units.some(u => u.equals(unit));
});
</script>

<template>
  <sprite-2d
    v-if="textures.length"
    :texture="textures[0]"
    event-mode="none"
    :anchor="0.5"
    :ref="
      (sprite: any) => {
        if (sprite) {
          (sprite as Sprite2d).proj.affine = AFFINE.AXIS_X;
        }
      }
    "
  >
    <template v-if="hasFilters">
      <outline-filter
        v-if="ui.highlightedUnit?.id === unit.id"
        :thickness="outlineThickness"
        :color="
          ui.highlightedUnit?.playerId === player.id ? 0x00aaff : 0xff0000
        "
      />

      <adjustment-filter v-if="isInAoe" :red="3" :brightness="0.8" />
    </template>
  </sprite-2d>
</template>
