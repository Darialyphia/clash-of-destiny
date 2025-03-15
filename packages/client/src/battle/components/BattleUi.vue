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
import TurnOrder from './TurnOrder.vue';
import PlayIntent from '@/card/components/PlayIntent.vue';
import PlayedCard from '@/card/components/PlayedCard.vue';
import UnitPanel from '@/unit/components/UnitPanel.vue';
import { useBattleUiStore } from '../stores/battle-ui.store';
import ActiveUnitActions from '@/unit/components/ActiveUnitActions.vue';
const { state } = useGameState();

const activeUnit = useActiveUnit();
const ui = useBattleUiStore();
</script>

<template>
  <TargetingUi />

  <DeployUi v-if="state.phase === GAME_PHASES.DEPLOY" />
  <div v-else class="battle-ui">
    <BattleLog />
    <TurnOrder />
    <PlayedCard />
    <PlayIntent />
    <footer>
      <Hand :unit="activeUnit" />
      <div class="unit-section">
        <transition appear mode="out-in" name="slide">
          <UnitPanel
            v-if="ui.selectedUnit"
            :key="ui.selectedUnit.id"
            :unit="ui.selectedUnit"
            class="selected-unit"
          />
        </transition>
        <transition appear mode="out-in" name="slide">
          <div :key="activeUnit.id" class="active-unit">
            <ActiveUnitActions />
            <UnitPanel :unit="activeUnit" />
          </div>
        </transition>
      </div>
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
  align-items: end;
}

.unit-section {
  justify-self: end;
  display: grid;
  gap: var(--size-3);
  grid-template-columns: 1fr auto;
  padding: var(--size-3);
}

.selected-unit {
  grid-column: 2;
}

.active-unit {
  grid-row: 2;
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: subgrid;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s var(--ease-spring-2);
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(25%);
}
</style>
