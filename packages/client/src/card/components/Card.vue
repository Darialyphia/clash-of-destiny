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
    exp?: number;
    rarity: Rarity;
    level?: number;
    allowedJobs?: Array<{ id: string; name: string }>;
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
      <div class="name">
        {{ card.name }}
      </div>
      <div class="mp-cost" v-if="card.manaCost">
        <span class="dual-text">{{ card.manaCost }}</span>
      </div>
      <div class="exp" v-if="card.exp">
        <span class="dual-text">{{ card.exp }}</span>
      </div>
      <div class="image" />
      <div class="image-frame" />
      <div class="rarity" />
      <div class="description">
        <div v-if="card.allowedJobs?.length">
          [{{ card.allowedJobs.map(j => j.name).join(' - ') }}]
        </div>
        <div>{{ card.description }}</div>
      </div>
      <div class="level" v-if="card.level">
        <img
          v-for="i in 3"
          :key="i"
          :src="
            card.level >= i
              ? '/assets/ui/card-level-filled.png'
              : '/assets/ui/card-level-empty.png'
          "
        />
      </div>
      <div class="kind">
        {{ card.kind }}
      </div>
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
  color: black;
  /* font-family: 'NotJamSlab14', monospace; */
  font-size: 14px;
}

.card-back {
  transform: rotateY(0.5turn);
  backface-visibility: hidden;
  background: url('/assets/ui/card-back3.png');
  background-size: cover;
}

.card-image {
  background: var(--bg);
  background-size: cover;
  width: calc(113px * var(--pixel-scale));
  height: calc(89px * var(--pixel-scale));
  margin: 0 auto;
}

.name {
  position: absolute;
  top: calc(1px * var(--pixel-scale));
  left: 50%;
  transform: translateX(-50%);
  width: calc(84px * var(--pixel-scale));
  height: calc(20px * var(--pixel-scale));
  background: url('/assets/ui/card-name.png');
  background-size: cover;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  display: grid;
  place-content: center;
  padding-top: calc(3px * var(--pixel-scale));
  /* text-shadow:
    0 1px 0 #efef9f,
    0 -1px 0 #efef9f,
    1px 0 0 #efef9f,
    -1px 0 0 #efef9f; */
}

.dual-text {
  background: linear-gradient(#fcfcfc, #fcfcfc 50%, #e6d67b 50%);
  background-clip: text;
  color: transparent;
}

.mp-cost {
  position: absolute;
  width: calc(23px * var(--pixel-scale));
  height: calc(23px * var(--pixel-scale));
  top: calc(2px * var(--pixel-scale));
  left: calc(2px * var(--pixel-scale));
  background: url('/assets/ui/card-mp.png');
  background-size: cover;
  color: white;
  font-size: 22px;
  font-family: 'NotJamSlab11', monospace;
  display: grid;
  place-content: center;
  padding-right: calc(2px * var(--pixel-scale));
}

.exp {
  position: absolute;
  width: calc(23px * var(--pixel-scale));
  height: calc(23px * var(--pixel-scale));
  top: calc(2px * var(--pixel-scale));
  right: calc(2px * var(--pixel-scale));
  background: url('/assets/ui/card-exp.png');
  background-size: cover;
  color: white;
  font-size: 22px;
  font-family: 'NotJamSlab11', monospace;
  display: grid;
  place-content: center;
  padding-left: calc(4px * var(--pixel-scale));
}

.image-frame {
  position: absolute;
  width: calc(116px * var(--pixel-scale));
  height: calc(92px * var(--pixel-scale));
  top: calc(22px * var(--pixel-scale));
  left: 50%;
  transform: translateX(-50%);
  background: url('/assets/ui/card-art-frame.png');
  background-size: cover;
}

.image {
  position: absolute;
  width: calc(106px * var(--pixel-scale));
  height: calc(85px * var(--pixel-scale));
  top: calc(27px * var(--pixel-scale));
  left: 50%;
  transform: translateX(-50%);
  background: v-bind(imageBg);
  background-size: cover;
}

.rarity {
  position: absolute;
  width: calc(8px * var(--pixel-scale));
  height: calc(11px * var(--pixel-scale));
  top: calc(99px * var(--pixel-scale));
  left: 50%;
  transform: translateX(-50%);
  background: v-bind(rarityBg);
  background-size: cover;
}

.description {
  position: absolute;
  top: calc(116px * var(--pixel-scale));
  left: 50%;
  transform: translateX(-50%);
  width: calc(116px * var(--pixel-scale));
  height: calc(56px * var(--pixel-scale));
  background: url('/assets/ui/card-description.png');
  background-size: cover;
  padding-inline: calc(12px * var(--pixel-scale));
  padding-block: calc(5px * var(--pixel-scale));
  line-height: 1;
  /* font-family: 'Jersey 10'; */
  font-size: 13px;
}

.level {
  position: absolute;
  top: calc(110px * var(--pixel-scale));
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: calc(1px * var(--pixel-scale));
  justify-content: center;

  img {
    width: calc(13px * var(--pixel-scale));
    height: calc(13px * var(--pixel-scale));
  }
}

.kind {
  position: absolute;
  top: calc(162px * var(--pixel-scale));
  left: 50%;
  transform: translateX(-50%);
  width: calc(72px * var(--pixel-scale));
  height: calc(14px * var(--pixel-scale));
  background: url('/assets/ui/card-type.png');
  background-size: cover;
  display: grid;
  place-content: center;
  font-weight: 500;
}
</style>
