<script setup lang="ts">
import type { CardViewModel } from '../card.model';
import Card from './Card.vue';
const { card } = defineProps<{ card: CardViewModel }>();
</script>

<template>
  <Card
    :card="{
      id: card.id,
      name: card.name,
      description: card.description,
      image: card.imagePath,
      kind: card.kind,
      affinity: card.affinity,
      manaCost: card.manaCost,
      destinyCost: card.destinyCost,
      rarity: card.rarity,
      job: card.job,
      atk: card.atk,
      hp: card.maxHp,
      spellpower: card.spellpower,
      level: card.level,
      unitKind: card.unitKind,
      durability: card.durability,
      abilities: card.abilities.map(a => a.text)
    }"
  />
</template>

<style scoped lang="postcss"></style>
