<script lang="ts" setup>
import { useKeyboardControl } from '@/shared/composables/useKeyboardControl';
import { useSettingsStore } from '@/shared/composables/useSettings';
import { useBattleStore, useGameState } from '../stores/battle.store';
import { useBattleUiStore } from '../stores/battle-ui.store';
import { GameSession } from '@game/engine/src/game/game-session';
import BoardProj from '@/board/scenes/BoardProj.vue';

const battleStore = useBattleStore();
const settingsStore = useSettingsStore();
const uiStore = useBattleUiStore();
const { state } = useGameState();

const session = new GameSession({
  mapId: '1v1',
  rngSeed: new Date().toISOString(),
  history: [],
  overrides: {},
  players: [
    {
      id: 'p1',
      name: 'Player 1',
      mainDeck: {
        cards: [
          'zoran-the-punisher',
          ...Array.from({ length: 4 }, () => 'flame-juggler'),
          ...Array.from({ length: 4 }, () => 'shrouded-sorcerer'),
          ...Array.from({ length: 4 }, () => 'garrison-marksman'),
          ...Array.from({ length: 4 }, () => 'shield-maiden'),
          ...Array.from({ length: 4 }, () => 'stalwart-vanguard'),
          ...Array.from({ length: 4 }, () => 'bubbly-slime'),
          ...Array.from({ length: 4 }, () => 'spark'),
          ...Array.from({ length: 4 }, () => 'fireball'),
          ...Array.from({ length: 4 }, () => 'esteemed-erudite')
        ]
      },
      destinyDeck: {
        cards: [
          'fire-shrine-of-knowledge',
          'aiden-child-of-the-storm',
          'aiden-stormrider',
          'aiden-thunder-incarnate',
          'equality-pendant',
          'insight',
          'slimes-to-the-rescue',
          'ceasefire',
          'pilfering-blade',
          'test-destiny-artifact'
        ]
      }
    },
    {
      id: 'p2',
      name: 'Player 2',
      mainDeck: {
        cards: [
          'zoran-the-punisher',
          ...Array.from({ length: 4 }, () => 'flame-juggler'),
          ...Array.from({ length: 4 }, () => 'shrouded-sorcerer'),
          ...Array.from({ length: 4 }, () => 'garrison-marksman'),
          ...Array.from({ length: 4 }, () => 'shield-maiden'),
          ...Array.from({ length: 4 }, () => 'stalwart-vanguard'),
          ...Array.from({ length: 4 }, () => 'bubbly-slime'),
          ...Array.from({ length: 4 }, () => 'spark'),
          ...Array.from({ length: 4 }, () => 'fireball'),
          ...Array.from({ length: 4 }, () => 'esteemed-erudite')
        ]
      },
      destinyDeck: {
        cards: [
          'fire-shrine-of-knowledge',
          'aiden-child-of-the-storm',
          'aiden-stormrider',
          'aiden-thunder-incarnate',
          'equality-pendant',
          'insight',
          'slimes-to-the-rescue',
          'ceasefire',
          'pilfering-blade',
          'test-destiny-artifact'
        ]
      }
    }
  ]
});
// @ts-expect-error
window._debugSession = () => {
  console.log(session.game);
};
// @ts-expect-error
window._debugClient = () => {
  console.log(battleStore.state);
};
session.initialize();
battleStore.init({
  id: 'p1',
  type: 'local',
  subscriber(onSnapshot) {
    session.subscribe(null, onSnapshot);
  },
  initialState: session.game.snapshotSystem.getLatestOmniscientSnapshot().state,
  dispatcher: input => {
    session.dispatch(input);
  }
});

useKeyboardControl(
  'keydown',
  () => settingsStore.settings.bindings.endTurn.control,
  () =>
    battleStore.dispatch({
      type: 'endTurn',
      payload: {}
    })
);
const ui = useBattleUiStore();
</script>

<template>
  <template v-if="state">
    <BoardProj />
    <Layer :ref="(layer: any) => ui.registerLayer(layer, 'scene')" />
    <Layer :ref="(layer: any) => ui.registerLayer(layer, 'fx')" />
    <Layer :ref="(layer: any) => ui.registerLayer(layer, 'ui')" />
  </template>
</template>
