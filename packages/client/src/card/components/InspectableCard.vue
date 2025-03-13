<script setup lang="ts">
import type { CardViewModel } from '../card.model';
import { useBattleUiStore } from '@/battle/stores/battle-ui.store';

const { card } = defineProps<{ card: CardViewModel }>();

const ui = useBattleUiStore();
</script>

<template>
  <Teleport to="#inspected-card" v-if="ui.inspectedCard?.equals(card)" defer>
    <Card
      ref="cardRef"
      :card="{
        id: card.id,
        name: card.name,
        description: card.description,
        image: card.imagePath,
        kind: card.kind,
        manaCost: card.manaCost
      }"
      class="hand-card__card"
    />
  </Teleport>
</template>

<style scoped lang="postcss"></style>
