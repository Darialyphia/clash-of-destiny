<script setup lang="ts">
import { useSpritesheet } from '@/shared/composables/useSpritesheet';
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';
import { OutlineFilter } from '@pixi/filter-outline';
import { AdjustmentFilter } from '@pixi/filter-adjustment';
import { useMultiLayerTexture } from '@/shared/composables/useMultiLayerTexture';
import { config } from '@/utils/config';
import type { UnitViewModel } from '../unit.model';
import {
  useBattleEvent,
  useGameState,
  useUserPlayer
} from '@/battle/stores/battle.store';
import { INTERACTION_STATES } from '@game/engine/src/game/systems/interaction.system';
import { pointToCellId } from '@game/engine/src/board/board-utils';
import { Container2d, AFFINE } from 'pixi-projection';
import { Filter, Point } from 'pixi.js';
import { GAME_EVENTS } from '@game/engine/src/game/game.events';
import { waitFor } from '@game/shared';

const { unit } = defineProps<{
  unit: UnitViewModel;
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

const exhaustedfilter = computed(() => {
  if (unit.isExhausted) {
    return new AdjustmentFilter({ saturation: 0 });
  }
  return null;
});

const isEvolving = ref(false);
const evolutionFilter = new AdjustmentFilter({ brightness: 1 });
useBattleEvent(GAME_EVENTS.UNIT_BEFORE_EVOLVE_HERO, async event => {
  if (event.unit.id === unit.id) {
    isEvolving.value = true;
    await gsap.to(evolutionFilter, {
      brightness: 5,
      gamma: 2,
      duration: 0.3,
      ease: Power2.easeIn
    });
    await waitFor(300);
    unit.updateSprite(event.newCard.spriteId);
    await gsap.to(evolutionFilter, {
      brightness: 1,
      gamma: 1,
      duration: 0.3,
      ease: Power2.easeIn
    });
    isEvolving.value = false;
  }
});

const outlineFilter = computed(() => {
  if (ui.selectedUnit?.equals(unit)) {
    return new OutlineFilter(outlineThickness.value, 0xffffff);
  }
  if (ui.highlightedUnit?.equals(unit)) {
    return new OutlineFilter(
      outlineThickness.value,
      ui.highlightedUnit.playerId === player.value.id ? 0x00aaff : 0xff0000
    );
  }
  return null;
});
const filters = computed(() => {
  const filters: Filter[] = [];
  if (isEvolving.value) {
    filters.push(evolutionFilter);
  }
  if (exhaustedfilter.value) {
    filters.push(exhaustedfilter.value);
  }
  if (outlineFilter.value) {
    filters.push(outlineFilter.value);
  }
  return filters;
});
</script>

<template>
  <container-2d
    :filters="filters"
    event-mode="none"
    :ref="
      (container: any) => {
        if (container) {
          (container as Container2d).proj.affine = AFFINE.AXIS_X;
          ui.assignLayer(container, 'scene');
        }
      }
    "
  >
    <sprite-2d
      v-if="textures.length"
      texture="/assets/pedestals/pedestal-default.png"
      :anchor="0.5"
    />
    <sprite-2d v-if="textures.length" :texture="textures[0]" :anchor="0.5" />
  </container-2d>
</template>
