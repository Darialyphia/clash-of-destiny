import { defineStore } from 'pinia';
import { useGameState } from './battle.store';
import { isDefined, type Nullable, type Point } from '@game/shared';
import type { SerializedCell } from '@game/engine/src/board/cell';
import type { SerializedUnit } from '@game/engine/src/unit/entities/unit.entity';
import { Layer } from '@pixi/layers';
import type { DisplayObject } from 'pixi.js';
import { pointToCellId } from '@game/engine/src/board/board-utils';

export const useInternalBattleUiStore = defineStore(
  'internal-battle-ui',
  () => {
    const hoveredCell = shallowRef<Nullable<SerializedCell>>(null);
    const highlightedUnit = ref<Nullable<SerializedUnit>>(null);
    const selectedUnitId = ref<Nullable<string>>(null);

    watch(hoveredCell, cell => {
      if (cell?.unit) {
        highlightedUnit.value = cell.unit;
      }
    });

    return { hoveredCell, highlightedUnit, selectedUnitId };
  }
);

export const useBattleUiStore = defineStore('battle-ui', () => {
  const uiStore = useInternalBattleUiStore();
  const { state } = useGameState();

  type LayerName = 'ui' | 'scene' | 'fx';

  const layers: Record<LayerName, Ref<Layer | undefined>> = {
    ui: ref(),
    scene: ref(),
    fx: ref()
  };

  return {
    registerLayer(layer: Layer, name: LayerName) {
      if (!layer) return;
      layers[name].value = layer;
      layer.group.enableSort = true;
      layer.sortableChildren = true;
    },
    assignLayer(obj: Nullable<DisplayObject>, name: LayerName) {
      if (!isDefined(obj)) return;
      obj.parentLayer = layers[name].value;
    },
    hoveredCell: computed(() => uiStore.hoveredCell),
    hoverAt(point: Point) {
      uiStore.hoveredCell = state.value.board.cells.find(
        cell => cell.id === pointToCellId(point)
      );
    },
    unHover() {
      uiStore.hoveredCell = null;
      uiStore.highlightedUnit = null;
    },

    highlightedUnit: computed(() => uiStore.highlightedUnit),
    highlightUnit(unit: SerializedUnit) {
      uiStore.highlightedUnit = unit;
    },
    unhighlightUnit() {
      uiStore.highlightedUnit = null;
    },

    selectedUnit: computed(() =>
      state.value.units.find(unit => unit.id === uiStore.selectedUnitId)
    ),
    selectUnit(unit: SerializedUnit) {
      uiStore.selectedUnitId = unit.id;
    },
    unselectUnit() {
      uiStore.selectedUnitId = null;
    }
  };
});
