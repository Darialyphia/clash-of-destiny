<script setup lang="ts">
import UiAnimatedSprite from '@/ui/scenes/UiAnimatedSprite.vue';
import type { CellViewModel } from '../models/cell.model';
import type { Defined } from '@game/shared';
import { useUserPlayer } from '@/battle/stores/battle.store';

const { obstacle } = defineProps<{
  obstacle: Defined<CellViewModel['obstacle']>;
}>();

const userPlayer = useUserPlayer();

const tag = computed(() => {
  if (!obstacle.player) return 'idle';

  return userPlayer.value.getPlayer().equals(obstacle.player.getPlayer())
    ? 'ally'
    : 'enemy';
});
</script>

<template>
  <UiAnimatedSprite :assetId="obstacle.spriteId" :y="-30" :tag="tag" />
</template>

<style scoped lang="postcss"></style>
