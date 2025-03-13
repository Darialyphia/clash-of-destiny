<script setup lang="ts">
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';
import Card from './Card.vue';

const props = defineProps<{}>();
const emit = defineEmits<{}>();

const ui = useBattleUiStore();
</script>

<template>
  <div class="play-intent">
    <Card
      v-if="ui.cardPlayIntent"
      :card="{
        id: ui.cardPlayIntent.id,
        name: ui.cardPlayIntent.name,
        description: ui.cardPlayIntent.description,
        image: ui.cardPlayIntent.imagePath,
        kind: ui.cardPlayIntent.kind,
        manaCost: ui.cardPlayIntent.manaCost
      }"
    />
  </div>
</template>

<style scoped lang="postcss">
.play-intent {
  position: fixed;
  top: 25%;
  right: var(--size-3);
}
</style>
