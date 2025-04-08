<script setup lang="ts">
import type { StyleProp } from '../ui-utils';
import {
  DialogRoot,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogPortal,
  VisuallyHidden
} from 'reka-ui';
export type ModalStyleVariables = '--ui-drawer-size';

const isOpened = defineModel<boolean>('isOpened', { required: true });
const {
  title,
  description = '',
  style = {},
  position = 'right',
  usePortal = true,
  hasOverlay = true
} = defineProps<{
  title: string;
  position?: 'left' | 'right';
  description?: string;
  style?: StyleProp<ModalStyleVariables>;
  usePortal?: boolean;
  hasOverlay?: boolean;
}>();
</script>

<template>
  <DialogRoot v-model:open="isOpened" modal>
    <DialogPortal :disabled="!usePortal">
      <Transition appear>
        <DialogOverlay v-if="hasOverlay" class="drawer-overlay" />
      </Transition>

      <Transition appear>
        <DialogContent class="drawer-content" :class="position" :style="style">
          <VisuallyHidden>
            <DialogTitle>
              <slot name="title" :title="title">{{ title }}</slot>
            </DialogTitle>
            <DialogDescription>
              {{ description }}
            </DialogDescription>
          </VisuallyHidden>

          <slot />
        </DialogContent>
      </Transition>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.drawer-overlay {
  position: fixed;
  z-index: 1;
  inset: 0;

  background-color: hsl(var(--gray-12-hsl) / 0.5);
  backdrop-filter: blur(5px);
  &:focus {
    outline: none;
  }
  &:is(.v-enter-active, .v-leave-active) {
    transition: opacity 0.3s;
  }

  &:is(.v-enter-from, .v-leave-to) {
    opacity: 0;
  }
}

.drawer-content {
  --_ui-drawer-size: var(--ui-drawer-size, var(--size-sm));

  position: fixed;
  z-index: 2;
  top: 0;
  height: 100dvh;

  container-type: inline-size;

  width: var(--_ui-drawer-size);

  &.right {
    right: 0;
    &.v-enter-from,
    &.v-leave-to {
      transform: translateX(100%);
    }
  }

  &.left {
    left: 0;
    &.v-enter-from,
    &.v-leave-to {
      transform: translateX(-100%);
    }
  }
  &:focus,
  &:focus-visible {
    outline: none;
  }
  > div {
    pointer-events: all;
  }

  &:is(.v-enter-active, .v-leave-active) {
    transition: transform 0.3s var(--ease-5);
  }
}
</style>
