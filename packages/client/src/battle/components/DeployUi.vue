<script setup lang="ts">
import { useBattleUiStore } from '../stores/battle-ui.store';
import {
  useBattleStore,
  useGameState,
  useUserPlayer
} from '../stores/battle.store';

const { state } = useGameState();
const battle = useBattleStore();
const ui = useBattleUiStore();

const switchPlayer = (id: string) => {
  battle.playerId = id;
  ui.unselectUnit();
};

const player = useUserPlayer();
</script>

<template>
  <div class="deploy-layout">
    <header>
      {{ state.phase }}
      <button
        @click="switchPlayer('p1')"
        :class="battle.playerId === 'p1' && 'active'"
      >
        Switch to Player 1
      </button>
      <button
        @click="switchPlayer('p2')"
        :class="battle.playerId === 'p2' && 'active'"
      >
        Switch to Player 2
      </button>
      <button
        @click="player.commitDeployment()"
        :class="{ active: player.hasDeployed }"
      >
        Confirm deployment
      </button>
      <button
        @click="
          () => {
            player.commitDeployment();
            player.getOpponent().commitDeployment();
          }
        "
      >
        Auto deploy
      </button>
    </header>

    <div />

    <footer>
      Your team

      <button
        v-for="hero in player.getHeroes()"
        :key="hero.id"
        :style="{ '--bg': `url('${hero.iconPath}')` }"
        :class="{ selected: ui.selectedUnit?.equals(hero) }"
        @mouseenter="ui.highlightUnit(hero)"
        @mouseleave="ui.unhighlightUnit()"
        @click="ui.selectUnit(hero)"
      >
        {{ hero.name }}
      </button>
    </footer>
  </div>
</template>

<style scoped lang="postcss">
.deploy-layout {
  height: 100dvh;
  user-select: none;
  display: grid;
  grid-template-rows: auto 1fr auto;
}

header {
  display: flex;
  gap: var(--size-3);
  justify-content: center;
  padding-block: var(--size-3);

  button {
    border: solid var(--border-size-1) white;
    pointer-events: auto;

    &.active {
      border-width: var(--border-size-2);
      border-color: var(--primary);
    }
  }
}

footer {
  display: flex;
  gap: var(--size-3);
  align-items: center;
  padding: var(--size-3);

  > button {
    width: var(--unit-icon-size);
    aspect-ratio: 1;
    background: linear-gradient(transparent 30%, hsl(0 0 0 / 0.75)), var(--bg);
    background-size: cover;
    pointer-events: auto;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    text-transform: uppercase;
    padding: var(--size-2);
    font-weight: var(--font-weight-5);
    &.selected {
      filter: brightness(1.5);
      box-shadow: 0 0 var(--size-2) yellow;
    }
  }
}
</style>
