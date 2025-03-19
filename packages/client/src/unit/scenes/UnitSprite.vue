<script setup lang="ts">
import { useSpritesheet } from '@/shared/composables/useSpritesheet';
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';
import { OutlineFilter } from '@pixi/filter-outline';
import { AdjustmentFilter } from '@pixi/filter-adjustment';
import { type Filter } from 'pixi.js';
import { useIsoCamera } from '@/iso/composables/useIsoCamera';
import { useMultiLayerTexture } from '@/shared/composables/useMultiLayerTexture';
import { config } from '@/utils/config';
import type { UnitViewModel } from '../unit.model';
import { useGameState, useUserPlayer } from '@/battle/stores/battle.store';
import { GAME_PHASES } from '@game/engine/src/game/systems/game-phase.system';

const { unit, hasFilters = true } = defineProps<{
  unit: UnitViewModel;
  hasFilters?: boolean;
}>();

const sheet = useSpritesheet<'', 'base' | 'destroyed'>(() => unit.spriteId);
const ui = useBattleUiStore();
const camera = useIsoCamera();
const { state } = useGameState();
const player = useUserPlayer();

const outlineThickness = ref(camera.viewport.value!.scale.x);
camera.viewport.value?.on('zoomed-end', () => {
  outlineThickness.value = camera.viewport.value!.scale.x;
});

const textures = useMultiLayerTexture({
  sheet,
  parts: () => unit.spriteParts,
  tag: 'idle',
  dimensions: config.UNIT_SPRITE_SIZE
});
</script>

<template>
  <animated-sprite
    v-if="textures.length"
    :textures="textures"
    event-mode="none"
    :anchor="0.5"
  >
    <template v-if="hasFilters">
      <outline-filter
        v-if="ui.highlightedUnit?.id === unit.id"
        :thickness="outlineThickness"
        :color="0xffffff"
      />
      <outline-filter
        v-else-if="
          ui.selectedUnit?.id === unit.id && state.phase === GAME_PHASES.BATTLE
        "
        :thickness="outlineThickness"
        :color="ui.selectedUnit?.playerId === player.id ? 0x00aaff : 0xff0000"
      />

      <!-- <adjustment-filter
        v-if="
          ui.selectedUnit?.id === unit.id && state.phase === GAME_PHASES.DEPLOY
        "
        :brightness="1.2"
        :blue="1.25"
      /> -->
    </template>
  </animated-sprite>
</template>
