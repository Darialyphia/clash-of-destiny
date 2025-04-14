<script setup lang="ts">
import { useGameState, useUserPlayer } from '../stores/battle.store';
import Hand from '@/card/components/Hand.vue';
import TargetingUi from './TargetingUi.vue';
import BattleLog from '@/battle/components/BattleLog.vue';
import DraggedCard from '@/card/components/DraggedCard.vue';
import InspectedCard from '@/card/components/InspectedCard.vue';
import PlayIntent from '@/card/components/PlayIntent.vue';
import PlayedCard from '@/card/components/PlayedCard.vue';
import { useBattleUiStore } from '../stores/battle-ui.store';
import TurnIndicator from '@/player/components/TurnIndicator.vue';
import { usePlayers } from '../stores/battle.store';
import PlayerActions from '@/player/components/PlayerActions.vue';
import DestinyPhaseUi from './DestinyPhaseUi.vue';
import BattlePlayerInfos from '@/player/components/BattlePlayerInfos.vue';
import HighlightedUnit from './HighlightedUnit.vue';
import EquipedArtifacts from './EquipedArtifacts.vue';
import { INTERACTION_STATES } from '@game/engine/src/game/systems/interaction.system';
import OpponentHand from './OpponentHand.vue';
import SelectCardInteractionUi from './SelectCardInteractionUi.vue';
import ErrorUi from './ErrorUi.vue';

const ui = useBattleUiStore();
const userPlayer = useUserPlayer();
const players = usePlayers();
const { state } = useGameState();
</script>

<template>
  <div
    class="battle-ui"
    :class="{
      cinematic:
        ui.cardPlayIntent ||
        state.interactionState.state === INTERACTION_STATES.SELECTING_TARGETS
    }"
  >
    <BattleLog />
    <header>
      <BattlePlayerInfos :player="players[0]" />
      <OpponentHand :player="userPlayer.getOpponent()" class="opponent-hand" />
      <BattlePlayerInfos :player="players[1]" />
    </header>

    <div class="flex justify-between mx-11">
      <EquipedArtifacts
        v-for="player in players"
        :key="player.id"
        :player="player"
      />
    </div>
    <PlayedCard />
    <PlayIntent />
    <TurnIndicator />
    <DestinyPhaseUi />
    <ErrorUi />
    <TargetingUi />
    <SelectCardInteractionUi />
    <HighlightedUnit />
    <footer>
      <Hand :player="userPlayer" />
      <PlayerActions class="player-actions" />
    </footer>
  </div>

  <DraggedCard />
  <InspectedCard />
</template>

<style scoped lang="postcss">
@property --battle-ui-cinematic-color {
  syntax: '<color>';
  inherits: false;
  initial-value: 'transparent';
}

.battle-ui {
  height: 100dvh;
  user-select: none;
  display: grid;
  grid-template-rows: auto 1fr auto;
  transition: --battle-ui-cinematic-color 0.3s var(--ease-2);
  background: radial-gradient(
    circle at center,
    transparent,
    transparent 20%,
    var(--battle-ui-cinematic-color)
  );
  &.cinematic {
    --battle-ui-cinematic-color: hsl(0 0 0 / 0.7);
  }
}

header {
  display: flex;
}

footer {
  grid-row: 3;
  display: grid;
  grid-template-columns: minmax(0, 0.7fr) minmax(0, 0.3fr);
  gap: var(--size-7);
  align-items: end;
}

.opponent-hand {
  flex-grow: 1;
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

.player-actions {
  justify-self: end;
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
