<script setup lang="ts">
import { useUserPlayer } from '@/battle/stores/battle.store';
import type { UnitViewModel } from '../unit.model';
import UiButton from '@/ui/components/UiButton.vue';
import UiDrawer from '@/ui/components/UiDrawer.vue';
import UnitDetails from './UnitDetails.vue';
import FancyButton from '@/ui/components/FancyButton.vue';

const { unit } = defineProps<{ unit: UnitViewModel }>();

const player = useUserPlayer();

const isUnitOwner = computed(() => unit.getPlayer().equals(player.value));

const isDetailsDrawerOpened = ref(false);
</script>

<template>
  <div class="unit-panel" :class="isUnitOwner ? 'ally' : 'enemy'">
    <div>
      <div class="name">{{ unit.name }}</div>

      <div class="flex gap-2">
        <img
          v-for="i in unit.maxAp"
          :src="`/assets/ui/${unit.ap >= i ? 'ap-indicator-ui' : 'ap-indicator-empty-ui'}.png`"
        />
      </div>
      <div class="flex gap-2 items-center mb-1">
        <img src="/assets/ui/hp.png" class="bar-icon" />
        <div>
          <span class="pl-1">{{ unit.hp }} / {{ unit.maxHp }}</span>
          <div class="hp-bar" />
        </div>
      </div>

      <div class="flex gap-2 items-center mb-1">
        <img src="/assets/ui/mp.png" class="bar-icon" />
        <div>
          <span class="pl-1">{{ unit.mp }} / {{ unit.maxMp }}</span>
          <div class="mp-bar" />
        </div>
      </div>

      <div class="flex gap-2 items-center" v-if="!unit.isMaxLevel">
        <img src="/assets/ui/exp.png" class="bar-icon" />
        <div>
          <span class="pl-1">{{ unit.exp }} / {{ unit.expToNextLevel }}</span>
          <div class="exp-bar" />
        </div>
      </div>
    </div>

    <div class="grid gap-2">
      <div class="portrait" :style="{ '--bg': `url('${unit.iconPath}')` }" />
      <FancyButton
        text="View"
        class="primary-button w-full"
        @click="isDetailsDrawerOpened = true"
      />
    </div>
    <UiDrawer
      v-model:is-opened="isDetailsDrawerOpened"
      :has-overlay="false"
      title="Hero Details"
    >
      <UnitDetails :unit="unit" />
    </UiDrawer>
  </div>
</template>

<style scoped lang="postcss">
.unit-panel {
  pointer-events: auto;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--size-4);
  padding: var(--size-5);
  border: solid 6px #efef9f;
  border-right-color: #d7ad42;
  border-bottom-color: #d7ad42;
  font-family: 'NotJamSlab14', monospace;
  font-size: 14px;
  text-shadow:
    0 2px 0 black,
    0 -2px 0 black,
    2px 0 0 black,
    -2px 0 0 black;
  &.ally {
    background-color: #00285c;
  }

  &.enemy {
    background-color: #32021b;
  }
}

.portrait {
  width: var(--unit-icon-size);
  aspect-ratio: 1;
  background: var(--bg);
  background-size: cover;
}

.name {
  font-size: var(--font-size-4);
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

.bar-icon {
  width: 30px;
  aspect-ratio: 1;
  transform: translateY(6px);
}
</style>
