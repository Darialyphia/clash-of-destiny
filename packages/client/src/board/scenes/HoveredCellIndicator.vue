<script setup lang="ts">
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';
import { useGameState, useUserPlayer } from '@/battle/stores/battle.store';
import UiAnimatedSprite from '@/ui/scenes/UiAnimatedSprite.vue';
import UnitOrientation from '@/unit/scenes/UnitOrientation.vue';
import UnitSprite from '@/unit/scenes/UnitSprite.vue';
import { config } from '@/utils/config';
import { GAME_PHASES } from '@game/engine/src/game/systems/game-phase.system';

const ui = useBattleUiStore();

const { state } = useGameState();

const player = useUserPlayer();

const canDeploy = computed(() => {
  return ui.hoveredCell?.getPlayer()?.equals(player.value);
});
</script>

<template>
  <UiAnimatedSprite assetId="hovered-cell" />
  <container
    v-if="canDeploy && ui.selectedUnit && state.phase === GAME_PHASES.DEPLOY"
    :alpha="0.5"
    :position="config.UNIT_SPRITE_OFFSET"
  >
    <UnitOrientation :unit="ui.selectedUnit">
      <UnitSprite :unit="ui.selectedUnit" />
    </UnitOrientation>
  </container>
</template>

<style scoped lang="postcss"></style>
