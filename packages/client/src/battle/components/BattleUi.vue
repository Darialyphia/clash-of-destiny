<script setup lang="ts">
import { GameSession } from '@game/engine';
import { useBattleStore } from '../stores/battle.store';

const battleStore = useBattleStore();

const session = new GameSession({
  mapId: '1v1',
  rngSeed: 'test',
  history: [],
  overrides: {},
  players: [
    {
      id: 'p1',
      name: 'Player 1',
      heroes: [
        {
          blueprintId: 'mage',
          deck: {
            cards: Array.from({ length: 30 }, () => 'magic-missile')
          }
        }
      ]
    },
    {
      id: 'p2',
      name: 'Player 2',
      heroes: [
        {
          blueprintId: 'mage',
          deck: {
            cards: Array.from({ length: 30 }, () => 'magic-missile')
          }
        }
      ]
    }
  ]
});

session.initialize();
battleStore.init({
  id: 'p1',
  type: 'local',
  subscriber(onSnapshot) {
    session.subscribe(null, onSnapshot);
  },
  initialState: session.game.snapshotSystem.getLatestOmniscientSnapshot().state,
  dispatcher: session.dispatch.bind(session)
});
</script>

<template>
  <div class="layout"></div>
</template>

<style scoped lang="postcss">
.layout {
  display: grid;
  height: 100dvh;
  grid-template-rows: 1fr 1fr;
  user-select: none;
}
</style>
