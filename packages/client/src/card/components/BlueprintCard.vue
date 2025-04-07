<script setup lang="ts">
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import Card from './Card.vue';

const { blueprint } = defineProps<{ blueprint: CardBlueprint }>();
</script>

<template>
  <Card
    :card="{
      id: blueprint.id,
      name: blueprint.name,
      description: blueprint.staticDescription,
      image: `/assets/icons/${blueprint.cardIconId}.png`,
      kind: blueprint.kind,
      affinity: blueprint.affinity,
      manaCost: (blueprint as any).manaCost,
      rarity: (blueprint as any).rarity,
      job: (blueprint as any).job,
      atk: (blueprint as any).atk,
      hp: (blueprint as any).maxHp,
      spellpower: (blueprint as any).spellpower,
      level: (blueprint as any).level,
      unitKind: (blueprint as any).unitKind,
      durability: (blueprint as any).durability
    }"
  />
</template>

<style scoped lang="postcss"></style>
