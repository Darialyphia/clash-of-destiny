<script setup lang="ts">
import type { CardKind } from '@game/engine/src/card/card.enums';
import { isDefined } from '@game/shared';

const { card } = defineProps<{
  card: {
    name: string;
    description: string;
    image: string;
    kind: CardKind;
    manaCost?: number;
  };
}>();
const emit = defineEmits<{}>();
</script>

<template>
  <div class="card">
    <div class="card-image" :style="{ '--bg': `url('${card.image}')` }" />
    <div class="name">{{ card.name }}</div>
    <div>kind: {{ card.kind }}</div>
    <div>{{ card.description }}</div>
    <div v-if="isDefined(card.manaCost)">Mana cost: {{ card.manaCost }}</div>
  </div>
</template>

<style scoped lang="postcss">
.card {
  --pixel-scale: 2;
  width: calc(126px * var(--pixel-scale));
  height: calc(178px * var(--pixel-scale));
  background-color: #69193a;
  padding: 8px;
  border: solid 3px black;
}

.card-image {
  background: var(--bg);
  background-size: cover;
  width: calc(113px * var(--pixel-scale));
  height: calc(89px * var(--pixel-scale));
  margin: 0 auto;
}

.name {
  font-weight: var(--font-weight-5);
}
</style>
