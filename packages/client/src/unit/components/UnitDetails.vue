<script setup lang="ts">
import {
  HoverCardContent,
  HoverCardPortal,
  HoverCardRoot,
  HoverCardTrigger
} from 'reka-ui';
import type { UnitViewModel } from '../unit.model';
import Card from '@/card/components/Card.vue';
import InspectableCard from '@/card/components/InspectableCard.vue';

const { unit } = defineProps<{ unit: UnitViewModel }>();

const weapon = computed(() => unit.getWeapon());
const armor = computed(() => unit.getArmor());
const relic = computed(() => unit.getRelic());
</script>

<template>
  <div class="unit-details">
    <header class="flex gap-4">
      <img :src="unit.iconPath" :alt="unit.name" class="portrait" />
      <div>
        <div class="text-5">{{ unit.name }}</div>
        <div class="flex gap-2 items-center mb-1">
          <img src="/assets/ui/hp.png" class="stat-icon" />
          <div>
            <span class="pl-1">{{ unit.hp }} / {{ unit.maxHp }}</span>
            <div class="hp-bar" />
          </div>
        </div>

        <div class="flex gap-2 items-center mb-1">
          <img src="/assets/ui/mp.png" class="stat-icon" />
          <div>
            <span class="pl-1">{{ unit.mp }} / {{ unit.maxMp }}</span>
            <div class="mp-bar" />
          </div>
        </div>

        <div class="flex gap-2 items-center" v-if="!unit.isMaxLevel">
          <img src="/assets/ui/exp.png" class="stat-icon" />
          <div>
            <span class="pl-1">{{ unit.exp }} / {{ unit.expToNextLevel }}</span>
            <div class="exp-bar" />
          </div>
        </div>
      </div>
    </header>

    <div class="flex gap-2 items-center mb-3">
      <img src="/assets/ui/attack.png" class="stat-icon" />
      Attack Damage: {{ unit.attackDamage }}
    </div>

    <div class="flex gap-2 items-center mb-3">
      <img src="/assets/ui/ability-power.png" class="stat-icon" />
      Ability Power: {{ unit.abilityPower }}
    </div>

    <div class="flex gap-2 items-center mb-3">
      <img src="/assets/ui/deck.png" class="stat-icon" />
      Deck: {{ unit.remainingCardsInDeck }} cards
    </div>

    Artifacts

    <div class="flex gap-2 items-center mb-3">
      <img src="/assets/ui/attack.png" class="stat-icon" />

      <HoverCardRoot v-if="weapon" :key="weapon.id">
        <HoverCardTrigger>
          <div>
            {{ weapon.getCard().name }} ({{ weapon.durability }} /
            {{ weapon.maxDurability }})
          </div>
        </HoverCardTrigger>

        <HoverCardPortal to="#card-portal">
          <HoverCardContent side="left">
            <InspectableCard :card="weapon.getCard()" />
          </HoverCardContent>
        </HoverCardPortal>
      </HoverCardRoot>
      <span v-else>None</span>
    </div>

    <div class="flex gap-2 items-center mb-3">
      <img src="/assets/ui/shield.png" class="stat-icon" />

      <HoverCardRoot v-if="armor" :key="armor.id">
        <HoverCardTrigger>
          <div>
            {{ armor.getCard().name }} ({{ armor.durability }} /
            {{ armor.maxDurability }})
          </div>
        </HoverCardTrigger>

        <HoverCardPortal to="#card-portal">
          <HoverCardContent side="left">
            <InspectableCard :card="armor.getCard()" />
          </HoverCardContent>
        </HoverCardPortal>
      </HoverCardRoot>
      <span v-else>None</span>
    </div>

    <div class="flex gap-2 items-center mb-3">
      <img src="/assets/ui/relic.png" class="stat-icon" />

      <HoverCardRoot v-if="relic" :key="relic.id">
        <HoverCardTrigger>
          <div>
            {{ relic.getCard().name }} ({{ relic.durability }} /
            {{ relic.maxDurability }})
          </div>
        </HoverCardTrigger>

        <HoverCardPortal to="#card-portal">
          <HoverCardContent side="left">
            <InspectableCard :card="relic.getCard()" />
          </HoverCardContent>
        </HoverCardPortal>
      </HoverCardRoot>
      <span v-else>None</span>
    </div>

    Discard pile ({{ unit.getDiscardPile().length }})
    <ul class="discard-pile">
      <HoverCardRoot v-for="card in unit.getDiscardPile()" :key="card.id">
        <HoverCardTrigger>
          <li :style="{ '--bg': `url('${card.imagePath}')` }">
            {{ card.name }}
          </li>
        </HoverCardTrigger>

        <HoverCardPortal to="#card-portal">
          <HoverCardContent side="left">
            <InspectableCard :card="card" />
          </HoverCardContent>
        </HoverCardPortal>
      </HoverCardRoot>
    </ul>
    <p v-if="!unit.getDiscardPile().length">Empty</p>
  </div>
</template>

<style scoped lang="postcss">
.unit-details {
  --pixel-scale: 4;
  background-color: #32021b;
  border: solid 6px #efef9f;
  border-bottom-color: #d7ad42;
  border-right-color: transparent;
  height: 100%;
  padding: var(--size-4);
}

header {
  margin-bottom: var(--size-5);
}
.portrait {
  width: calc(32px * var(--pixel-scale));
  aspect-ratio: 1;
  align-self: end;
}

.hp-bar {
  width: var(--size-11);
  height: var(--size-3);
  position: relative;
  background-color: black;
  transform: skewX(-10deg);
  box-shadow: 5px 5px 0 black;
  border-bottom: solid var(--border-size-2) #efef9f;
  border-right: solid var(--border-size-2) #efef9f;
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to right in lch, #e5233e, #ffe822, #4ab907);
    --percentage: v-bind('unit.hp / unit.maxHp * 100 + "%"');
    clip-path: polygon(
      0% 0%,
      var(--percentage) 0%,
      var(--percentage) 100%,
      0% 100%
    );
  }
}

.mp-bar {
  width: var(--size-11);
  height: var(--size-3);
  position: relative;
  background-color: black;
  transform: skewX(-10deg);
  box-shadow: 5px 5px 0 black;
  border-bottom: solid var(--border-size-2) #efef9f;
  border-right: solid var(--border-size-2) #efef9f;
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to right in lch, #662fe1, #2ea3ea, #00fff1);
    --percentage: v-bind('unit.mp / unit.maxMp * 100 + "%"');
    clip-path: polygon(
      0% 0%,
      var(--percentage) 0%,
      var(--percentage) 100%,
      0% 100%
    );
  }
}

.exp-bar {
  width: var(--size-11);
  height: var(--size-3);
  position: relative;
  background-color: black;
  transform: skewX(-10deg);
  box-shadow: 5px 5px 0 black;
  border-bottom: solid var(--border-size-2) #efef9f;
  border-right: solid var(--border-size-2) #efef9f;
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to right in lch, #bb8225, #e1c711, #fffe00);
    --percentage: v-bind('unit.exp / unit.expToNextLevel * 100 + "%"');
    clip-path: polygon(
      0% 0%,
      var(--percentage) 0%,
      var(--percentage) 100%,
      0% 100%
    );
  }
}

.stat-icon {
  width: 30px;
  aspect-ratio: 1;

  header & {
    transform: translateY(6px);
  }
}

.discard-pile {
  font-size: 14px;
  li {
    padding-block: var(--size-4);
    padding-inline-start: var(--size-11);
    background: var(--bg);
    background-position: left center;
    background-repeat: no-repeat;
    margin-block: var(--size-2);
    border: solid var(--border-size-2) black;
  }
}
</style>
