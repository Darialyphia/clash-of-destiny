<script setup lang="ts">
import type { PlayerViewModel } from '@/player/player.model';

const { player } = defineProps<{ player: PlayerViewModel }>();
</script>

<template>
  <container-2d>
    <sprite-2d
      texture="/assets/ui/card-back4.png"
      v-for="i in player.remainingCardsInDeck"
      :key="i"
      :y="-i * 2"
    />
  </container-2d>
</template>
