import { useIsoWorld } from './useIsoWorld';
import type { Nullable, Point } from '@game/shared';
import { useIso } from './useIso';
import type { MaybeRefOrGetter } from 'vue';
import { useBattleStore } from '@/battle/stores/battle.store';

export type UseIsoTileOptions = {
  position: MaybeRefOrGetter<Point>;
  zIndexOffset?: MaybeRefOrGetter<Nullable<number>>;
};

export const useIsoPoint = ({ position }: UseIsoTileOptions) => {
  const grid = useIsoWorld();

  const isoPosition = useIso(
    computed(() => toValue(position)),
    computed(() => ({
      dimensions: { width: grid.width.value, height: grid.height.value },
      angle: grid.angle.value,
      scale: grid.scale.value
    }))
  );

  const tweened = ref({ ...isoPosition.value });

  const store = useBattleStore();

  watch(isoPosition, newPos => {
    gsap.to(tweened.value, {
      duration: store.isPlayingFx ? 0 : 0.5,
      pixi: {
        x: newPos.x,
        y: newPos.y
      },
      ease: Power1.easeInOut
    });
  });

  return tweened;
};
