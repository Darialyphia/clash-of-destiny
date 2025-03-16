<script setup lang="ts">
import { RouterLink, type RouterLinkProps } from 'vue-router';

defineOptions({ inheritAttrs: false });

export type ButtonProps = {
  isLoading?: boolean;
  isInline?: boolean;
  to?: RouterLinkProps['to'];
  text: string;
  variant?: 'primary' | 'error';
};

const {
  isLoading = false,
  variant = 'primary',
  isInline,
  text,
  to
} = defineProps<ButtonProps>();

const attrs = useAttrs();

const tag = computed(() => {
  if (attrs.href) return 'a';
  if (to) return RouterLink;
  return 'button';
});
</script>

<template>
  <component
    :is="tag"
    class="fancy-button"
    :class="[
      {
        'is-inline': isInline,
        'is-loading': isLoading
      },
      variant
    ]"
    :disabled="attrs.disabled || isLoading"
    v-bind="attrs"
  >
    <!-- <UiSpinner v-if="isLoading" /> -->
    <span class="content" :data-text="text">
      {{ text }}
    </span>
  </component>
</template>

<style scoped lang="postcss">
@import 'open-props/media';

@layer components {
  .fancy-button {
    font-size: 28px;
    font-weight: var(--font-weight-4);

    display: flex;
    gap: var(--size-2);
    align-items: center;
    justify-content: center;

    width: fit-content;
    padding: var(--size-2-em) var(--size-3-em);

    font-family: 'NotJamSlab14', monospace;
    white-space: nowrap;
    position: relative;
    z-index: 0;

    border-image-slice: 39 fill;
    border-image-width: 39px;
    border-radius: var(--_ui-button-radius);

    transition: filter 0.2s;

    &.primary {
      border-image-source: url('/assets/ui/button.png');
    }

    &.error {
      border-image-source: url('/assets/ui/button-error.png');
    }

    &:disabled {
      cursor: not-allowed;
    }

    &,
    &:hover {
      text-decoration: none;
    }

    &:hover &:active {
      transform: scale(0.98);
      transition: transform 0.2s;
    }

    &:focus-visible {
      color: var(--_ui-button-focus-color);
      background-color: var(--_ui-button-focus-bg);
    }
    &.is-inline {
      display: inline-flex;
    }

    & > .icon {
      display: block;
      flex-shrink: 0;
      aspect-ratio: 1;
      font-size: var(--font-size-4);
    }

    &:hover:not(:disabled) {
      color: var(--_ui-button-hover-color);
      /* background-color: var(--_ui-button-hover-bg); */
      filter: brightness(1.2);
    }
  }
}

.content {
  position: relative;
  color: transparent;
  &::before,
  &::after {
    position: absolute;
    content: attr(data-text);
    color: transparent;
    inset: 0;
  }
  &:after {
    background-clip: text;
  }
  .primary &::after {
    background-image: linear-gradient(#fcfcfc, #fcfcfc 50%, #e6d67b 50%);
  }

  .error &::after {
    background-image: linear-gradient(#fcfcfc, #fcfcfc 50%, #ff9da3 50%);
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
</style>
