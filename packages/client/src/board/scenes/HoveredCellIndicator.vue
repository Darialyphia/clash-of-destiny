<script setup lang="ts">
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';
import { useGameState } from '@/battle/stores/battle.store';
import UiAnimatedSprite from '@/ui/scenes/UiAnimatedSprite.vue';
import UnitSprite from '@/unit/scenes/UnitSprite.vue';
import { config } from '@/utils/config';
import { GAME_PHASES } from '@game/engine/src/game/systems/game-phase.system';

const ui = useBattleUiStore();

const { state } = useGameState();
</script>

<template>
  <UiAnimatedSprite assetId="hovered-cell" />
  <container
    v-if="ui.selectedUnit && state.phase === GAME_PHASES.DEPLOY"
    :alpha="0.5"
    :position="config.UNIT_SPRITE_OFFSET"
  >
    <UnitSprite :unit="ui.selectedUnit" />
  </container>
</template>

<style scoped lang="postcss"></style>
