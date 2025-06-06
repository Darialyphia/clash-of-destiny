import type { Container } from 'pixi.js';
import type { Ref } from 'vue';

export interface ShakeProps {
  isBidirectional: boolean; // shake X and Y - if false only shakes X
  shakeCountMax: number; // how many times to repeat shake
  shakeAmount: number; // the variance of the shake in pixels I.e. 10 would shake a random number of pixels between -5 and 5
  shakeDelay: number; // the delay between each shake repeat in milliseconds
}

export const useShaker = (container: Ref<Container | undefined>) => {
  const state = {
    isBidirectional: true,
    shakeCountMax: 10,
    shakeAmount: 6,
    shakeDelay: 25,
    isShaking: false,
    shakeCount: 0
  };

  const trigger = (shakeProps?: ShakeProps): void => {
    const step = (obj: Container) => {
      state.shakeCount++;
      if (state.shakeCount > state.shakeCountMax) {
        obj.position.set(originalPos.x, originalPos.y);
        state.shakeCount = 0;
        state.isShaking = false;
      } else {
        obj.position.x =
          Math.floor(Math.random() * state.shakeAmount) - state.shakeAmount / 2;
        if (state.isBidirectional) {
          obj.position.y =
            Math.floor(Math.random() * state.shakeAmount) -
            state.shakeAmount / 2;
        }
        setTimeout(() => step(obj), state.shakeDelay);
      }
    };
    if (!container.value) return;
    const originalPos = { x: container.value.x, y: container.value.y };
    if (shakeProps) {
      state.shakeCountMax = shakeProps.shakeCountMax;
      state.shakeAmount = shakeProps.shakeAmount;
      state.shakeDelay = shakeProps.shakeDelay;
      state.isBidirectional = shakeProps.isBidirectional;
    }

    if (!state.isShaking) {
      state.isShaking = true;
      state.shakeCount = 0;
    }
    step(toRaw(container.value));
  };
  return { trigger };
};
