<script setup lang="ts">
import { isString } from '@game/shared';
import Card from './Card.vue';
import {
  HoverCardRoot,
  HoverCardContent,
  HoverCardTrigger,
  HoverCardPortal
} from 'reka-ui';
import { KEYWORDS, type Keyword } from '@game/engine/src/card/card-keyword';
import type { CardBlueprint } from '@game/engine/src/card/card-blueprint';
import { CARDS_DICTIONARY } from '@game/engine/src/card/sets';
import BlueprintCard from './BlueprintCard.vue';

const { text, highlighted = true } = defineProps<{
  text: string;
  highlighted?: boolean;
}>();

const KEYWORD_DELIMITER = '@';

type Token =
  | { type: 'text'; text: string }
  | { type: 'keyword'; text: string; keyword: Keyword }
  | { type: 'card'; card: CardBlueprint; text: string }
  | { type: 'exhaust' }
  | { type: 'mana'; text: string };

const tokens = computed<Token[]>(() => {
  if (!text.includes(KEYWORD_DELIMITER)) return [{ type: 'text', text }];

  return text.split(KEYWORD_DELIMITER).map(part => {
    const keyword = Object.values(KEYWORDS).find(keyword => {
      return (
        part.toLowerCase().match(keyword.name.toLowerCase()) ||
        keyword.aliases.some(alias => {
          return isString(alias)
            ? part.toLowerCase().match(alias.toLowerCase())
            : part.toLowerCase().match(alias);
        })
      );
    });
    if (keyword) return { type: 'keyword', text: part, keyword };
    const card = Object.values(CARDS_DICTIONARY).find(c => c.name === part);
    if (card)
      return {
        type: 'card',
        text: part,
        card: card
      };

    if (part === '[exhaust]') return { type: 'exhaust' };
    if (part.startsWith('[mana]'))
      return { type: 'mana', text: part.replace('[mana] ', '') };
    return { type: 'text', text: part };
  });
});
</script>

<template>
  <div class="card-text">
    <span
      v-for="(token, index) in tokens"
      :key="index"
      :class="highlighted && `token-${token.type}`"
    >
      <img
        v-if="token.type === 'exhaust'"
        src="/assets/ui/ability-exhaust.png"
        class="inline"
      />
      <HoverCardRoot v-else :open-delay="500" :close-delay="0">
        <HoverCardTrigger>
          {{ token.text }}
        </HoverCardTrigger>
        <HoverCardPortal>
          <HoverCardContent v-if="highlighted" class="z-10" side="right">
            <article>
              <div v-if="token.type === 'keyword'" class="keyword-card">
                <div class="font-600">{{ token.keyword.name }}</div>
                <p class="text-0">{{ token.keyword.description }}</p>
              </div>
              <BlueprintCard
                v-if="token.type === 'card'"
                :blueprint="token.card"
              />
            </article>
          </HoverCardContent>
        </HoverCardPortal>
      </HoverCardRoot>
    </span>
  </div>
</template>

<style scoped lang="postcss">
:is(.token-keyword, .token-card) {
  font-weight: var(--font-weight-7);
}

.token-mana {
  background-color: #5185ff;
  border-radius: var(--radius-round);
  width: var(--size-5);
  height: var(--size-5);
  border: solid 2px #662fe1;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}
.token-card {
  color: var(--cyan-2);
}

.keyword-card {
  font-size: var(--font-size-0);
  width: var(--size-14);
  padding: var(--size-3);
  color: var(--text-1);
  background-color: black;
}

.card-text {
  white-space: pre-wrap;
}
</style>
