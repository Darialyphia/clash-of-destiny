<script setup lang="ts">
import {
  CARD_KINDS,
  RARITIES,
  UNIT_KINDS,
  type Affinity,
  type CardKind,
  type Rarity,
  type UnitKind
} from '@game/engine/src/card/card.enums';
import { isDefined } from '@game/shared';
import CardText from '@/card/components/CardText.vue';

const { card } = defineProps<{
  card: {
    id: string;
    name: string;
    description: string;
    image: string;
    kind: CardKind;
    affinity: Affinity;
    manaCost?: number;
    destinyCost?: number;
    unitKind?: UnitKind;
    rarity: Rarity;
    level?: number;
    job?: string;
    atk?: number;
    hp?: number;
    spellpower?: number;
    durability?: number;
    abilities?: string[];
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

const kindBg = computed(() => {
  if (!isDefined(card.unitKind)) {
    return `url('/assets/ui/card-kind-${card.kind.toLowerCase()}.png')`;
  } else if (card.unitKind === UNIT_KINDS.SHRINE) {
    return `url('/assets/ui/card-kind-hero.png')`;
  }
  return `url('/assets/ui/card-kind-${card.unitKind.toLowerCase()}.png')`;
});

const imageBg = computed(() => {
  return `url('${card.image}')`;
});

const affinityBg = computed(() => {
  return `url('/assets/ui/card-bg-${card.affinity.toLowerCase()}.png')`;
});
const affinityGemBg = computed(() => {
  return `url('/assets/ui/gem-${card.affinity.toLowerCase()}.png')`;
});
</script>

<template>
  <div class="card" :class="card.kind" :data-flip-id="`card_${card.id}`">
    <div class="card-front">
      <div class="image" />
      <div class="name" :data-text="card.name">
        {{ card.name }}
      </div>
      <div class="affinity-gem" />
      <div class="affinity-gem" />

      <div class="level" v-if="card.level">
        <div v-for="i in card.level" :key="i" class="level-icon" />
      </div>

      <div class="rarity" />
      <div class="stats">
        <div v-if="isDefined(card.manaCost)" class="mana-cost">
          <div class="dual-text" :data-text="card.manaCost">
            {{ card.manaCost }}
          </div>
        </div>
        <div v-if="isDefined(card.destinyCost)" class="destiny-cost">
          <div class="dual-text" :data-text="card.destinyCost">
            {{ card.destinyCost }}
          </div>
        </div>
        <div v-if="isDefined(card.atk)" class="atk">
          <div class="dual-text" :data-text="card.atk">
            {{ card.atk }}
          </div>
        </div>
        <div v-if="isDefined(card.spellpower)" class="spellpower">
          <div class="dual-text" :data-text="card.spellpower">
            {{ card.spellpower }}
          </div>
        </div>
        <div v-if="isDefined(card.hp)" class="hp">
          <div class="dual-text" :data-text="card.hp">
            {{ card.hp }}
          </div>
        </div>
        <div v-if="isDefined(card.durability)" class="durability">
          <div class="dual-text" :data-text="card.durability">
            {{ card.durability }}
          </div>
        </div>
      </div>
      <div class="kind">
        <div class="kind-icon" />
        {{ card.kind }} - {{ card.job }}
      </div>
      <div class="description">
        <CardText :text="card.description" />
        <CardText
          v-for="ability in card.abilities"
          :key="ability"
          :text="ability"
        />
      </div>
    </div>
    <div class="card-back" />
  </div>
</template>

<style scoped lang="postcss">
.card {
  --pixel-scale: 2;
  width: calc(160px * var(--pixel-scale));
  height: calc(224px * var(--pixel-scale));
  display: grid;
  transform-style: preserve-3d;

  > * {
    grid-column: 1;
    grid-row: 1;
  }
}

.card-front {
  backface-visibility: hidden;
  background: url('/assets/ui/card-bg.png'), v-bind(affinityBg);
  background-size: cover;
  color: #fcffcb;
  /* font-family: 'NotJamSlab14', monospace; */
  font-size: 16px;
  padding: 1rem;
}

.card-back {
  transform: rotateY(0.5turn);
  backface-visibility: hidden;
  background: url('/assets/ui/card-back4.png');
  background-size: cover;
}

.dual-text {
  color: transparent;
  position: relative;
  &::before,
  &::after {
    position: absolute;
    content: attr(data-text);
    color: transparent;
    inset: 0;
  }
  &:after {
    background: linear-gradient(#fcfcfc, #fcfcfc 40%, #ffb270 40%);
    background-clip: text;
  }
  &:before {
    text-shadow:
      0 2px black,
      0 -2px black,
      2px 0 black,
      -2px 0 black;
    z-index: -1;
  }
}

.image {
  background: v-bind(imageBg);
  background-size: cover;
  background-position: center -15px;
  width: calc(96px * var(--pixel-scale));
  height: calc(96px * var(--pixel-scale));
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.name {
  width: calc(96px * var(--pixel-scale));
  text-align: center;
  text-wrap: pretty;
  position: absolute;
  top: calc(90px * var(--pixel-scale));
  left: 50%;
  transform: translateX(-50%);
  font-size: 18px;
  line-height: 1.1;
  -webkit-text-stroke: 4px black;
  paint-order: stroke fill;
}

.affinity-gem {
  background: v-bind(affinityGemBg);
  background-size: cover;
  background-position: center;
  width: calc(26px * var(--pixel-scale));
  height: calc(28px * var(--pixel-scale));
  position: absolute;
  top: calc(2px * var(--pixel-scale));
  right: calc(2px * var(--pixel-scale));
}

.rarity {
  background: v-bind(rarityBg);
  background-size: cover;
  background-position: center;
  width: calc(12px * var(--pixel-scale));
  height: calc(15px * var(--pixel-scale));
  position: absolute;
  top: calc(112px * var(--pixel-scale));
  left: 50%;
  transform: translateX(-50%);
}

.stats {
  position: absolute;
  top: calc(2px * var(--pixel-scale));
  left: calc(2px * var(--pixel-scale));
  display: flex;
  gap: calc(2px * var(--pixel-scale));
  flex-direction: column;
  > * {
    z-index: 0;
    background-size: cover;
    background-position: center;
    width: calc(28px * var(--pixel-scale));
    height: calc(30px * var(--pixel-scale));
    display: grid;
    place-content: center;
    font-size: 28px;
    padding-top: calc(4px * var(--pixel-scale));
    font-family: 'NotJamSlab11', monospace;
  }
}

.level {
  position: absolute;
  top: calc(32px * var(--pixel-scale));
  right: calc(9px * var(--pixel-scale));
  display: flex;
  flex-direction: column;
  > * {
    background-image: url('/assets/ui/card-level-filled.png');
    background-size: cover;
    background-position: center;
    width: calc(13px * var(--pixel-scale));
    height: calc(13px * var(--pixel-scale));
    display: grid;
    place-content: center;
    font-size: 28px;
    padding-top: calc(4px * var(--pixel-scale));
    font-family: 'NotJamSlab11', monospace;
  }
}

.mana-cost {
  background-image: url('/assets/ui/card-mana.png');
}

.destiny-cost {
  background-image: url('/assets/ui/card-destiny.png');
}

.atk {
  background-image: url('/assets/ui/card-attack.png');
}

.spellpower {
  background-image: url('/assets/ui/card-spellpower.png');
}

.hp {
  background-image: url('/assets/ui/card-hp.png');
}

.durability {
  background-image: url('/assets/ui/card-durability.png');
}

.kind {
  width: calc(96px * var(--pixel-scale));
  height: calc(16px * var(--pixel-scale));
  position: absolute;
  top: calc(128px * var(--pixel-scale));
  left: calc(20px * var(--pixel-scale));
  display: flex;
  align-items: center;
  gap: calc(2px * var(--pixel-scale));

  font-size: 14px;
  .kind-icon {
    background: v-bind(kindBg);
    background-size: cover;
    background-position: center;
    width: calc(16px * var(--pixel-scale));
    aspect-ratio: 1;
  }
}

.description {
  width: calc(116px * var(--pixel-scale));
  height: calc(60px * var(--pixel-scale));
  position: absolute;
  top: calc(147px * var(--pixel-scale));
  left: calc(24px * var(--pixel-scale));
  font-size: 14px;
}
</style>
