<script setup lang="ts">
import { useTurnPlayer } from '@/battle/stores/battle.store';
import type { PlayerViewModel } from '../player.model';

const { player } = defineProps<{
  player: PlayerViewModel;
}>();

const turnPlayer = useTurnPlayer();
</script>

<template>
  <div
    class="battle-player-infos"
    :class="{ 'is-active': player.equals(turnPlayer) }"
  >
    <div class="name">{{ player.name }}</div>
    <div>HP: {{ player.currentHp }} / {{ player.maxHp }}</div>
    <div>Mana: {{ player.mana }} / {{ player.maxMana }}</div>
    <div>Destiny: {{ player.destiny }}</div>
  </div>
</template>

<style scoped lang="postcss">
.battle-player-infos.is-active .name {
  color: var(--yellow-4);
}

.name {
  font-size: var(--font-size-4);
  font-weight: var(--font-weight-5);
}
</style>
