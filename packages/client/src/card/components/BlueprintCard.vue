<script setup lang="ts">
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import Card from './Card.vue';
import { match } from 'ts-pattern';
import { CARD_KINDS } from '@game/engine/src/card/card.enums';
import { CARDS_DICTIONARY } from '@game/engine/src/card/sets';
import { UNIT_KINDS } from '@game/engine/src/card/card.enums';

const { blueprint } = defineProps<{ blueprint: CardBlueprint }>();

const allowedJobs = computed(() => {
  return match(blueprint)
    .with({ kind: CARD_KINDS.UNIT }, () => [])
    .with({ kind: CARD_KINDS.ABILITY }, card =>
      card.classIds.map(id => ({ id, name: CARDS_DICTIONARY[id].name }))
    )
    .with({ kind: CARD_KINDS.ARTIFACT }, card =>
      card.classIds.map(id => ({ id, name: CARDS_DICTIONARY[id].name }))
    )
    .with({ kind: CARD_KINDS.QUEST }, () => [])
    .with({ kind: CARD_KINDS.STATUS }, () => [])
    .exhaustive();
});
</script>

<template>
  <Card
    :card="{
      id: blueprint.id,
      name: blueprint.name,
      description: blueprint.staticDescription,
      kind: blueprint.kind,
      image: `/assets/icons/${blueprint.cardIconId}.png`,
      rarity: blueprint.rarity,
      exp: blueprint.kind === CARD_KINDS.ABILITY ? blueprint.exp : undefined,
      manaCost:
        blueprint.kind === CARD_KINDS.ABILITY ? blueprint.manaCost : undefined,
      allowedJobs: allowedJobs,
      level:
        blueprint.kind === CARD_KINDS.UNIT &&
        blueprint.unitKind === UNIT_KINDS.HERO
          ? blueprint.level
          : undefined
    }"
  />
</template>

<style scoped lang="postcss"></style>
