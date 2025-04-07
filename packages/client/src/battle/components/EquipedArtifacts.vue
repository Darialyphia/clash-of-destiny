<script setup lang="ts">
import BattleCard from '@/card/components/BattleCard.vue';
import type { PlayerViewModel } from '@/player/player.model';
import { HoverCardContent, HoverCardTrigger, HoverCardRoot } from 'reka-ui';

const { player } = defineProps<{ player: PlayerViewModel }>();

const artifacts = computed(() => player.getArtifacts());
</script>

<template>
  <ul class="grid gap-2 mt-4">
    <HoverCardRoot v-for="artifact in artifacts" :key="artifact.id">
      <HoverCardTrigger :close-delay="0" :open-delay="0">
        <li :style="{ '--bg': `url(${artifact.getCard().imagePath})` }">
          <div class="durability" v-for="i in artifact.durability" />
        </li>
      </HoverCardTrigger>

      <HoverCardContent side="right" :side-offset="35">
        <BattleCard :card="artifact.getCard()" />
      </HoverCardContent>
    </HoverCardRoot>
  </ul>
</template>

<style scoped lang="postcss">
li {
  --pixel-scale: 1;
  pointer-events: auto;
  width: calc(48px * var(--pixel-scale));
  height: calc(64px * var(--pixel-scale));
  background-image: var(--bg);
  background-position: center;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: var(--size-1);
  .durability {
    width: calc(6px * var(--pixel-scale));
    height: calc(12px * var(--pixel-scale));
    background: url(/assets/ui/artifact-durability.png) no-repeat center;
  }
}
</style>
