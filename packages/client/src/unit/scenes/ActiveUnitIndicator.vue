<script setup lang="ts">
import { useActiveUnit, useGameState } from '@/battle/stores/battle.store';
import UiAnimatedSprite from '@/ui/scenes/UiAnimatedSprite.vue';
import type { UnitViewModel } from '../unit.model';
import { GAME_PHASES } from '@game/engine/src/game/systems/game-phase.system';
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';

const { unit } = defineProps<{ unit: UnitViewModel }>();
const { state } = useGameState();
const activeUnit = useActiveUnit();

const isActive = computed(() => activeUnit.value.equals(unit));
const ui = useBattleUiStore();
</script>

<template>
  <container :ref="(container: any) => ui.assignLayer(container, 'ui')">
    <UiAnimatedSprite
      v-if="isActive && state.phase === GAME_PHASES.BATTLE"
      asset-id="active-unit-indicator"
      :y="-55"
    />
  </container>
</template>
