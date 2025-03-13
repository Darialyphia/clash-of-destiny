<script setup lang="ts">
import { GAME_PHASES } from '@game/engine/src/game/systems/game-phase.system';
import { useActiveUnit, useGameState } from '../stores/battle.store';
import DeployUi from './DeployUi.vue';
import Hand from '@/card/components/Hand.vue';
import ActiveUnitPanel from '@/unit/components/ActiveUnitPanel.vue';
import TargetingUi from './TargetingUi.vue';
import BattleLog from '@/battle/components/BattleLog.vue';
import DraggedCard from '@/card/components/DraggedCard.vue';
import InspectedCard from '@/card/components/InspectedCard.vue';

const { state } = useGameState();

const activeUnit = useActiveUnit();
</script>

<template>
  <TargetingUi />

  <DeployUi v-if="state.phase === GAME_PHASES.DEPLOY" />
  <div v-else class="battle-ui">
    <BattleLog />
    <footer>
      <Hand :unit="activeUnit" />
      <ActiveUnitPanel class="active-unit" />
    </footer>
  </div>

  <DraggedCard />
  <InspectedCard />
</template>

<style scoped lang="postcss">
.battle-ui {
  height: 100dvh;
  user-select: none;
  display: grid;
  grid-template-rows: auto 1fr auto;
}

footer {
  grid-row: 3;
  display: grid;
  grid-template-columns: minmax(0, 0.6fr) minmax(0, 0.4fr);
  gap: var(--size-7);
}

.active-unit {
  align-self: end;
  justify-self: end;
}
</style>
