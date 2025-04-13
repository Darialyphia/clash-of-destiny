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
import { clamp, isDefined, mapRange } from '@game/shared';
import CardText from '@/card/components/CardText.vue';
import { until, useElementBounding, useMouse } from '@vueuse/core';
import { autoTextSize } from 'auto-text-size';

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

const root = useTemplateRef('card');
const { x, y } = useMouse();

const rect = useElementBounding(root);
const pointerStyle = computed(() => {
  const pointer = {
    x: clamp(x.value - rect.left.value, 0, rect.width.value),
    y: clamp(y.value - rect.top.value, 0, rect.height.value)
  };
  const percent = {
    x: (pointer.x / rect.width.value) * 100,
    y: (pointer.y / rect.height.value) * 100
  };
  return {
    glareX: pointer.x,
    glareY: pointer.y,
    foilX: Math.round(mapRange(percent.x, [0, 100], [37, 63])),
    foilY: Math.round(mapRange(percent.y, [0, 100], [33, 67])),
    pointerFromCenter: clamp(
      Math.sqrt(
        (percent.y - 50) * (percent.y - 50) +
          (percent.x - 50) * (percent.x - 50)
      ) / 50,
      0,
      1
    )
  };
});

const descriptionBox = useTemplateRef('description-box');

const MIN_TEXT_SIZE = 10;
const MAX_TEXT_SIZE = 14;
const textSize = ref(MAX_TEXT_SIZE);
until(descriptionBox)
  .toBeTruthy()
  .then(box => {
    const inner = box.firstChild as HTMLElement;
    let outerHeight = box.clientHeight;
    let innerHeight = inner.clientHeight;

    while (innerHeight > outerHeight) {
      textSize.value--;
      box.style.fontSize = `${textSize.value}px`;

      innerHeight = inner.clientHeight;
      if (textSize.value <= MIN_TEXT_SIZE) {
        break;
      }
    }
  });
</script>

<template>
  <div
    class="card"
    :class="card.kind.toLocaleLowerCase()"
    :data-flip-id="`card_${card.id}`"
    ref="card"
  >
    <div class="card-front">
      <!-- <div class="foil" /> -->
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
        {{
          card.kind === CARD_KINDS.UNIT
            ? card.unitKind?.toLocaleLowerCase()
            : card.kind.toLocaleLowerCase()
        }}
        <template v-if="card.job">-</template>
        {{ card.job?.toLocaleLowerCase() }}
      </div>
      <div class="description" ref="description-box">
        <div>
          <CardText :text="card.description" />
          <CardText
            v-for="ability in card.abilities"
            :key="ability"
            :text="ability"
          />
        </div>
      </div>
      <div class="glare lt-lg:hidden" />
    </div>
    <div class="card-back" />
  </div>
</template>

<style scoped lang="postcss">
.card {
  --pixel-scale: 2;
  --glare-x: calc(1px * v-bind('pointerStyle?.glareX'));
  --glare-y: calc(1px * v-bind('pointerStyle?.glareY'));
  --foil-x: calc(1% * v-bind('pointerStyle?.foilX'));
  --foil-y: calc(1% * v-bind('pointerStyle?.foilY'));
  --pointer-from-center: v-bind('pointerStyle?.pointerFromCenter');
  width: calc(var(--card-width) * var(--pixel-scale));
  height: calc(var(--card-height) * var(--pixel-scale));
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
  background-position: center;
  width: calc(96px * var(--pixel-scale));
  height: calc(96px * var(--pixel-scale));
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);

  .unit & {
    background-position: center -10px;
  }
}

.name {
  width: calc(100px * var(--pixel-scale));
  text-align: center;
  text-wrap: pretty;
  position: absolute;
  top: calc(90px * var(--pixel-scale));
  left: 50%;
  transform: translateX(-50%);
  font-size: 18px;
  line-height: 1.1;
  -webkit-text-stroke: 4px black;
  font-weight: var(--font-weight-5);
  paint-order: stroke fill;
  height: calc(20px * var(--pixel-scale));
  display: grid;
  align-items: center;
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
  text-transform: capitalize;
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
  height: calc(58px * var(--pixel-scale));
  position: absolute;
  top: calc(147px * var(--pixel-scale));
  left: calc(24px * var(--pixel-scale));
  font-size: calc(1px * v-bind(textSize));
  overflow: hidden;
}

.glare {
  position: absolute;
  pointer-events: none;
  inset: 0;
  overflow: hidden;
  opacity: 0;
  transition: opacity 0.3s;
  background-image: radial-gradient(
    circle at var(--glare-x) var(--glare-y),
    hsla(0, 0%, 100%, 0.8) 10%,
    hsla(0, 0%, 100%, 0.65) 20%,
    hsla(0, 0%, 0%, 0.5) 90%
  );
  mix-blend-mode: overlay;
  mask-image: url('/assets/ui/card-bg.png');
  mask-size: cover;

  .card:hover & {
    opacity: 0.8;
  }
}

@property --foil-angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

@keyframes foil-spin {
  from {
    --foil-angle: 0deg;
  }
  to {
    --foil-angle: 360deg;
  }
}
.foil {
  --space: 5%;
  --foil-angle: 0deg;
  --img-size: 300% 400%;
  position: absolute;
  inset: 0;
  animation: foil-spin 10s infinite linear;
  background: repeating-linear-gradient(
    var(--foil-angle),
    hsla(283, 49%, 60%, 0.75) calc(var(--space) * 1),
    hsla(2, 74%, 59%, 0.75) calc(var(--space) * 2),
    hsla(53, 67%, 53%, 0.75) calc(var(--space) * 3),
    hsla(93, 56%, 52%, 0.75) calc(var(--space) * 4),
    hsla(176, 38%, 50%, 0.75) calc(var(--space) * 5),
    hsla(228, 100%, 77%, 0.75) calc(var(--space) * 6),
    hsla(283, 49%, 61%, 0.75) calc(var(--space) * 7)
  );
  background-size: var(--img-size);
  opacity: 0.7;
  mix-blend-mode: color-dodge;
  background-position:
    0% calc(33% * 1),
    63% 33%;
  /* background-position:
    0% calc(var(--foil-y) * 1),
    var(--foil-x) var(--foil-y); */
  /* opacity: 0; */
  /* display: none; */
  transition: opacity 0.3s;
  filter: brightness(0.85) contrast(2.75) saturate(0.65);
  mask-image: url('/assets/ui/card-bg.png');
  mask-size: cover;

  &::after {
    position: absolute;
    inset: 0;
    content: '';
    background-image: radial-gradient(
      farthest-corner ellipse at calc(((var(--glare-x)) * 0.5) + 25%)
        calc(((var(--glare-y)) * 0.5) + 25%),
      hsl(0, 0%, 100%) 5%,
      hsla(300, 100%, 11%, 0.6) 40%,
      hsl(0, 0%, 22%) 120%
    );
    background-position: center center;
    background-size: 400% 500%;
    filter: brightness(calc((var(--pointer-from-center) * 0.2) + 0.4))
      contrast(0.85) saturate(1.1);
    mix-blend-mode: hard-light;
  }
}
</style>
