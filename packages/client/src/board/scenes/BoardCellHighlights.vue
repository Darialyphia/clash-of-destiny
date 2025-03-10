<script setup lang="ts">
import { PTransition } from 'vue3-pixi';
import UiAnimatedSprite from '@/ui/scenes/UiAnimatedSprite.vue';
import { GAME_PHASES } from '@game/engine/src/game/game-phase.system';
import type { CellViewModel } from '../models/cell.model';
import { UI_MODES, useBattleUiStore } from '@/battle/stores/battle-ui.store';
import { isDefined, Vec3 } from '@game/shared';
import { match } from 'ts-pattern';
import { useCamera } from '../composables/useCamera';
import { useIsKeyboardControlPressed } from '@/shared/composables/useKeyboardControl';
import { useSettingsStore } from '@/shared/composables/useSettings';
import { CARD_KINDS } from '@game/engine/src/card/card-enums';
import {
  useBattleStore,
  usePathHelpers,
  useUserPlayer
} from '@/battle/stores/battle.store';
import { useTutorialStore } from '@/tutorial/tutorial.store';
import { useSpritesheet } from '@/shared/composables/useSpritesheet';
import UiLayerContainer from '@/ui/scenes/UiLayerContainer.vue';
import { altar } from '@game/engine/src/card/cards/basic/altar';

const { cell } = defineProps<{ cell: CellViewModel }>();

const battleStore = useBattleStore();
const camera = useCamera();
const ui = useBattleUiStore();
const pathHelpers = usePathHelpers();

const isWithinCardRange = computed(() => {
  if (!ui.selectedCard) return;
  const isTargetable = ui.selectedCard
    .getCard()
    .isWithinRange(cell.getCell(), ui.cardTargets.length, ui.cardTargets);

  if (ui.selectedCard.kind === CARD_KINDS.UNIT && !ui.cardTargets.length) {
    return isTargetable && cell.isWalkable && !cell.isOccupied;
  }

  return isTargetable;
});

const isHovered = computed(() => ui.hoveredCell?.equals(cell.getCell()));
const canTarget = computed(() => {
  if (!ui.selectedCard) return;
  return ui.isTargetValid(cell);
});

const canMove = computed(() => {
  return !!ui.selectedUnit && pathHelpers.canMoveTo(ui.selectedUnit, cell);
});

const settingsStore = useSettingsStore();
const isAttackRangeDisplayed = useIsKeyboardControlPressed(
  () => settingsStore.settings.bindings.showAttackRange.control
);
const canAttack = computed(() => {
  if (ui.mode === UI_MODES.PLAY_CARD) return false;
  if (ui.mode !== UI_MODES.BASIC) return false;

  return isAttackRangeDisplayed.value
    ? ui.selectedUnit?.getUnit().attackTargettingPattern.isWithinRange(cell)
    : isDefined(cell.getCell().unit) &&
        ui.selectedUnit?.getUnit().canAttackAt(cell);
});

const isOnPath = computed(() => {
  if (camera.isDragging.value) return false;
  if (!ui.selectedUnit) return false;
  if (!ui.hoveredCell) return false;
  if (!canMove.value) return false;

  const path = pathHelpers.getPathTo(ui.selectedUnit, ui.hoveredCell);

  return path?.path.some(point => point.equals(cell));
});

const isInCardAoe = computed(() => {
  if (!ui.selectedCard) return false;
  if (!ui.hoveredCell) return false;
  const targets = [...ui.cardTargets, ui.hoveredCell];
  const aoe = ui.selectedCard.getAoe(targets);
  if (!aoe) return false;

  const aoeTargets = aoe?.getCells(targets);
  // a unit's first target is always the place where it'll be summoned
  if (
    ui.selectedCard.kind === CARD_KINDS.UNIT &&
    ui.cardTargets.length &&
    aoeTargets.some(c => c.position.equals(ui.cardTargets[0]))
  ) {
    return false;
  }

  return aoeTargets.some(c => c.equals(cell.getCell()));
});
const userPlayer = useUserPlayer();

const tutorial = useTutorialStore();
const tag = computed(() => {
  if (
    battleStore.state.phase !== GAME_PHASES.BATTLE ||
    battleStore.isPlayingFx
  ) {
    return null;
  }

  if (
    tutorial.highlightedCell?.x === cell.x &&
    tutorial.highlightedCell?.y === cell.y &&
    tutorial.highlightedCell?.z === cell.z
  ) {
    return 'tutorial';
  }

  if (!ui.mode) return null;
  return match(ui.mode)
    .with(UI_MODES.BASIC, () => {
      if (!ui.selectedUnit?.player.equals(userPlayer.value)) {
        return null;
      }
      if (canAttack.value) {
        return 'danger';
      }
      if (isOnPath.value) {
        return 'movement-path';
      }

      if (canMove.value) {
        return 'movement';
      }

      return null;
    })
    .with(UI_MODES.PLAY_CARD, () => {
      if (isInCardAoe.value && !isHovered.value) {
        return 'targeting-range';
      }
      if (canTarget.value) {
        return isHovered.value ? 'targeting-valid-hover' : 'targeting-valid';
      }
      // if (isWithinCardRange.value) {
      //   return 'targeting-range';
      // }

      return null;
    })
    .exhaustive();
});
</script>

<template>
  <PTransition
    appear
    :duration="{ enter: 200, leave: 200 }"
    :before-enter="{ alpha: 0 }"
    :enter="{ alpha: 1 }"
    :leave="{ alpha: 0 }"
  >
    <UiAnimatedSprite
      v-if="tag"
      assetId="tile-highlights"
      :tag="tag"
      :anchor="0.5"
    />
  </PTransition>
  <UiLayerContainer v-if="tag === 'tutorial'">
    <sprite
      texture="/assets/ui/tutorial-arrow.png"
      :anchor="0.5"
      :y="cell.obstacle?.blueprintId === altar.id ? -75 : -60"
    />
  </UiLayerContainer>
</template>
