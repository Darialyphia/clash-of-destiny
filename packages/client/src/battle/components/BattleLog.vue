<script setup lang="ts">
import {
  useBattleEvent,
  useGameState,
  useTurnPlayer,
  useUnits
} from '@/battle/stores/battle.store';
import { vOnClickOutside } from '@vueuse/components';
import type { CardViewModel } from '@/card/card.model';
import type { UnitViewModel } from '@/unit/unit.model';
import type { PlayerViewModel } from '../../player/player.model';
import type { Point } from '@game/shared';
import { GAME_EVENTS } from '@game/engine/src/game/game.events';
import { pointToCellId } from '@game/engine/src/board/board-utils';
import { Icon } from '@iconify/vue';
import { HoverCardContent, HoverCardRoot, HoverCardTrigger } from 'reka-ui';
import InspectableCard from '@/card/components/InspectableCard.vue';
import { GAME_PHASES } from '@game/engine/src/game/game.enums';

const { state } = useGameState();
const units = useUnits();
type Token =
  | {
      kind: 'text';
      text: string;
    }
  | { kind: 'card'; card: CardViewModel }
  | {
      kind: 'unit';
      unit: UnitViewModel;
    }
  | {
      kind: 'player';
      player: PlayerViewModel;
    }
  | {
      kind: 'input';
      player: PlayerViewModel;
    }
  | { kind: 'position'; point: Point }
  | { kind: 'turn_start'; player: PlayerViewModel }
  | { kind: 'turn_end'; player: PlayerViewModel }
  | { kind: 'action'; text: string };

const events = shallowRef<Token[][]>([[]]);
const turnPlayer = useTurnPlayer();
events.value.push([
  {
    kind: 'turn_start',
    player: turnPlayer.value
  }
]);

useBattleEvent(GAME_EVENTS.PLAYER_BEFORE_PLAY_CARD, async event => {
  events.value.push([
    {
      kind: 'unit',
      unit: state.value.entities[event.player.id] as UnitViewModel
    },
    { kind: 'text', text: 'played' },
    { kind: 'card', card: state.value.entities[event.card.id] as CardViewModel }
  ]);
});

useBattleEvent(GAME_EVENTS.PLAYER_BEFORE_DRAW, async event => {
  events.value.push([
    {
      kind: 'unit',
      unit: state.value.entities[event.player.id] as UnitViewModel
    },
    { kind: 'text', text: `draws ${event.amount} cards` }
  ]);
});

useBattleEvent(GAME_EVENTS.UNIT_BEFORE_ATTACK, async event => {
  const tokens: Token[] = [
    {
      kind: 'unit',
      unit: state.value.entities[event.unit.id] as UnitViewModel
    },
    { kind: 'text', text: 'attacked' }
  ];
  const target = units.value.find(
    u => u.getCell().id === pointToCellId(event.target)
  );
  if (target) {
    tokens.push({ kind: 'unit', unit: target });
  }
  events.value.push(tokens);
});

useBattleEvent(GAME_EVENTS.UNIT_BEFORE_RECEIVE_DAMAGE, async event => {
  events.value.push([
    {
      kind: 'unit',
      unit: state.value.entities[event.unit.id] as UnitViewModel
    },
    {
      kind: 'text',
      text: `took ${event.damage} damage from`
    },
    { kind: 'unit', unit: state.value.entities[event.from.id] as UnitViewModel }
  ]);
});

useBattleEvent(GAME_EVENTS.UNIT_AFTER_RECEIVE_HEAL, async event => {
  events.value.push([
    {
      kind: 'unit',
      unit: state.value.entities[event.unit.id] as UnitViewModel
    },
    { kind: 'text', text: `got healed for ${event.amount} by` },
    { kind: 'unit', unit: state.value.entities[event.from.id] as UnitViewModel }
  ]);
});

useBattleEvent(GAME_EVENTS.UNIT_AFTER_MOVE, async event => {
  events.value.push([
    {
      kind: 'unit',
      unit: state.value.entities[event.unit.id] as UnitViewModel
    },
    { kind: 'text', text: `moved from` },
    { kind: 'position', point: event.previousPosition },
    { kind: 'text', text: `to` },
    { kind: 'position', point: event.position }
  ]);
});

useBattleEvent(GAME_EVENTS.PLAYER_START_TURN, async event => {
  events.value.push([
    {
      kind: 'turn_start',
      player: state.value.entities[event.player.id] as PlayerViewModel
    }
  ]);
});

useBattleEvent(GAME_EVENTS.PLAYER_END_TURN, async event => {
  events.value.push([
    {
      kind: 'turn_end',
      player: state.value.entities[event.player.id] as PlayerViewModel
    },
    { kind: 'text', text: 'ended their turn' }
  ]);
});

useBattleEvent(GAME_EVENTS.UNIT_AFTER_DESTROY, async event => {
  events.value.push([
    {
      kind: 'unit',
      unit: state.value.entities[event.unit.id] as UnitViewModel
    },
    { kind: 'text', text: `got destroyed.` }
  ]);
});

useBattleEvent(GAME_EVENTS.PLAYER_BEFORE_RESOURCE_ACTION_DRAW, async event => {
  events.value.push([
    {
      kind: 'text',
      text: `${event.player.name} draws 1 card with their resource action.`
    }
  ]);
});

useBattleEvent(
  GAME_EVENTS.PLAYER_BEFORE_RESOURCE_ACTION_REPLACE,
  async event => {
    events.value.push([
      {
        kind: 'text',
        text: `${event.player.name} replaces a card with their resource action.`
      }
    ]);
  }
);
useBattleEvent(
  GAME_EVENTS.PLAYER_BEFORE_RESOURCE_ACTION_DESTINY,
  async event => {
    events.value.push([
      {
        kind: 'text',
        text: `${event.player.name} banished ${event.amount} cards to gain destiny with their resource action.`
      }
    ]);
  }
);
useBattleEvent(GAME_EVENTS.UNIT_AFTER_DESTROY, async event => {
  events.value.push([
    {
      kind: 'text',
      text: `${event.unit.name} was destroyed.`
    }
  ]);
});

const isCollapsed = ref(true);

const listEl = ref<HTMLElement>();
watch(isCollapsed, collapsed => {
  if (!collapsed) {
    nextTick(() => {
      listEl.value?.scrollTo({
        top: listEl.value.scrollHeight,
        behavior: 'instant'
      });
    });
  }
});

watch(
  () => events.value.length,
  () => {
    if (isCollapsed.value) return;
    nextTick(() => {
      listEl.value?.scrollTo({
        top: listEl.value.scrollHeight,
        behavior: 'smooth'
      });
    });
  }
);

const close = () => {
  isCollapsed.value = true;
};

const isAction = (event: Pick<Token, 'kind'>[]) =>
  event.some(t => t.kind === 'action');
</script>

<template>
  <div
    v-on-click-outside="close"
    class="combat-log fancy-scrollbar"
    :class="isCollapsed && 'is-collapsed'"
  >
    <h4>Battle Log</h4>
    <ul v-if="!isCollapsed" ref="listEl" class="fancy-scrollbar">
      <li
        v-for="(event, index) in events"
        :key="index"
        :class="isAction(event) && 'action'"
      >
        <span
          v-for="(token, tokenIndex) in event"
          :key="tokenIndex"
          :class="token.kind"
        >
          <template v-if="token.kind === 'text'">{{ token.text }}</template>
          <template v-else-if="token.kind === 'action'">
            {{ token.text }}
          </template>
          <template v-else-if="token.kind === 'card'">
            <HoverCardRoot>
              <HoverCardTrigger>
                <span class="card">{{ token.card.name }}</span>
              </HoverCardTrigger>

              <HoverCardContent side="right" :side-offset="20">
                <InspectableCard :card="token.card" />
              </HoverCardContent>
            </HoverCardRoot>
          </template>
          <template v-else-if="token.kind === 'unit'">
            {{ token.unit.name }}
          </template>
          <template v-else-if="token.kind === 'input'">
            {{ token.player.name }}
          </template>
          <template v-else-if="token.kind === 'position'">
            [{{ token.point.x }}, {{ token.point.y }}]
          </template>
          <template v-else-if="token.kind === 'player'">
            {{ token.player.name }}
          </template>
          <template v-else-if="token.kind === 'turn_start'">
            {{ token.player.name }}
          </template>
          <template v-else-if="token.kind === 'turn_end'">
            {{ token.player.name }}
          </template>
        </span>
      </li>
    </ul>
    <button class="toggle" @click="isCollapsed = !isCollapsed">
      <Icon icon="game-icons:scroll-unfurled" />
    </button>
  </div>
</template>

<style scoped lang="postcss">
.combat-log {
  position: fixed;
  top: 25%;

  pointer-events: auto;
  font-size: 16px;
  color: #efef9f;
  user-select: none;
  background-color: #32021b;
  padding: var(--size-5);
  border: solid 6px #efef9f;
  border-right-color: #d7ad42;
  border-bottom-color: #d7ad42;
  box-shadow: 3px 3px 0 black;

  display: grid;
  grid-template-rows: auto 1fr;

  width: 26rem;
  height: var(--size-15);
  z-index: 1;
  @screen lt-lg {
    width: 20rem;
    height: var(--size-13);
  }

  padding-inline: 0;

  line-height: 2;

  transition: transform 0.2s var(--ease-5);

  &.is-collapsed {
    transform: translateX(-100%);
    padding: var(--size-2);
  }

  > button {
    align-self: start;
    margin-inline-start: auto;
  }
}

h4 {
  padding-block-end: var(--size-4);
  padding-inline-start: var(--size-3);
}

ul {
  overflow-y: auto;
}
li {
  display: flex;
  flex-wrap: wrap;
  gap: 1ch;

  padding-block: var(--size-1);
  padding-inline-start: var(--size-6);

  &.action {
    background-color: hsl(0 0 100% / 0.05);
  }
}

.toggle {
  position: absolute;
  bottom: 20%;
  left: 100%;
  transform: translateY(-6px);

  width: var(--size-8);
  height: calc(var(--size-9) + var(--size-1) + 1px);
  padding: 0;

  display: grid;
  place-content: center;

  font-family: 'Press Start 2P';
  color: #efef9f;
  user-select: none;
  background-color: #32021b;
  border: solid 6px #efef9f;
  border-right-color: #d7ad42;
  border-bottom-color: #d7ad42;
  text-shadow: 0 4px 0px #4e3327;
  box-shadow: 3px 3px 0 black;

  border-left: none;
  > svg {
    aspect-ratio: 1;
    width: var(--size-7);
  }

  @screen lt-lg {
    height: var(--size-9);
  }
}

.player,
.unit,
.input,
.card,
.position {
  font-weight: var(--font-weight-7);
}

.input {
  color: var(--cyan-5);

  li:has(&) {
    padding-inline-start: var(--size-3);
  }
}

.unit {
  color: var(--orange-6);
}

.card {
  color: var(--orange-6);
  z-index: 1;
}

.turn_start {
  flex-grow: 1;

  font-weight: var(--font-weight-6);
  text-align: center;

  background-color: hsl(0 0 100% / 0.1);

  li:has(&) {
    padding: 0;
  }
}
</style>
