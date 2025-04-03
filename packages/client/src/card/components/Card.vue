<script setup lang="ts">
import {
  CARD_KINDS,
  RARITIES,
  type CardKind,
  type Rarity
} from '@game/engine/src/card/card.enums';
import { isDefined } from '@game/shared';

const { card } = defineProps<{
  card: {
    id: string;
    name: string;
    description: string;
    image: string;
    kind: CardKind;
    manaCost?: number;
    destinyCost?: number;
    rarity: Rarity;
    level?: number;
    job?: string;
    atk?: number;
    hp?: number;
    spellpower?: number;
  };
}>();

const rarityBg = computed(() => {
  if (
    [RARITIES.BASIC, RARITIES.COMMON, RARITIES.TOKEN].includes(
      card.rarity as any
    )
  ) {
    return `url('/assets/ui/card-rarity-common.png')`;
  }

  return `url('/assets/ui/card-rarity-${card.rarity}.png')`;
});

const imageBg = computed(() => {
  return `url('${card.image}')`;
});
</script>

<template>
  <div class="card" :data-flip-id="`card_${card.id}`">
    <div class="card-front">
      <div v-if="isDefined(card.manaCost)" class="dual-text">
        {{ card.manaCost }} Mana
      </div>
      <div v-if="isDefined(card.destinyCost)" class="dual-text">
        {{ card.destinyCost }} Destiny
      </div>
      <div class="kind">{{ card.kind }} - {{ card.job }}</div>
      <div class="flex gap-2">
        <div v-if="isDefined(card.atk)">{{ card.atk }} /</div>
        <div v-if="isDefined(card.spellpower)">{{ card.spellpower }} /</div>
        <div v-if="isDefined(card.hp)">{{ card.hp }}</div>
      </div>
      <div class="name">
        {{ card.name }}
      </div>
      <div>{{ card.description }}</div>
    </div>
    <div class="card-back" />
  </div>
</template>

<style scoped lang="postcss">
.card {
  --pixel-scale: 2;
  width: calc(126px * var(--pixel-scale));
  height: calc(178px * var(--pixel-scale));
  display: grid;
  transform-style: preserve-3d;

  > * {
    grid-column: 1;
    grid-row: 1;
  }
}

.card-front {
  backface-visibility: hidden;
  background: url('/assets/ui/card-bg.png');
  background-size: cover;
  color: #fcffcb;
  /* font-family: 'NotJamSlab14', monospace; */
  font-size: 16px;
  padding: 1rem;
}

.card-back {
  transform: rotateY(0.5turn);
  backface-visibility: hidden;
  background: url('/assets/ui/card-back3.png');
  background-size: cover;
}

.dual-text {
  background: linear-gradient(#fcfcfc, #fcfcfc 50%, #e6d67b 50%);
  background-clip: text;
  color: transparent;
}
</style>
