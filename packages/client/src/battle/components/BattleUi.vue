<script setup lang="ts">
import { useTurnPlayer, useGameState } from '../stores/battle.store';
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

import BattlePlayerInfos from '@/player/components/BattlePlayerInfos.vue';

const turnPlayer = useTurnPlayer();
const ui = useBattleUiStore();

const players = usePlayers();
const { state } = useGameState();
</script>

<template>
  <TargetingUi />

  <div class="battle-ui" :class="{ cinematic: ui.cardPlayIntent }">
    <BattleLog />
    <header>
      {{ state.phase }} | {{ ui.selectedUnit?.id ?? 'no unit selected' }}
      <div class="flex justify-between">
        <BattlePlayerInfos
          v-for="player in players"
          :key="player.id"
          :player="player"
        />
      </div>
    </header>

    <PlayedCard />
    <PlayIntent />
    <TurnIndicator />
    <footer>
      <Hand :player="turnPlayer" />
      <PlayerActions class="player-actions" />
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
  transition: background 0.3s var(--ease-2);
  &.cinematic {
    background: radial-gradient(
      circle at center,
      transparent,
      transparent 20%,
      hsl(0 0 0 / 0.7)
    );
  }
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
