import { defineStore } from 'pinia';
import { useCells, useGameState, useUnits } from './battle.store';
import { isDefined, type Nullable, type Point } from '@game/shared';
import type { SerializedCell } from '@game/engine/src/board/cell';
import type { SerializedUnit } from '@game/engine/src/unit/entities/unit.entity';
import { Layer } from '@pixi/layers';
import type { DisplayObject } from 'pixi.js';
import { pointToCellId } from '@game/engine/src/board/board-utils';
import type { UnitViewModel } from '@/unit/unit.model';
import type { CellViewModel } from '@/board/cell.model';

export const useInternalBattleUiStore = defineStore(
  'internal-battle-ui',
  () => {
    const hoveredCell = shallowRef<Nullable<CellViewModel>>(null);
    const highlightedUnit = ref<Nullable<UnitViewModel>>(null);
    const selectedUnitId = ref<Nullable<string>>(null);

    watch(hoveredCell, cell => {
      const unit = cell?.getUnit();
      if (unit) {
        highlightedUnit.value = unit;
      }
    });

    return { hoveredCell, highlightedUnit, selectedUnitId };
  }
);

export const useBattleUiStore = defineStore('battle-ui', () => {
  const uiStore = useInternalBattleUiStore();
  const { state } = useGameState();
  const cells = useCells();
  const units = useUnits();

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
      uiStore.hoveredCell = cells.value.find(
        cell => cell.id === pointToCellId(point)
      );
    },
    unHover() {
      uiStore.hoveredCell = null;
      uiStore.highlightedUnit = null;
    },

    highlightedUnit: computed(() => uiStore.highlightedUnit),
    highlightUnit(unit: UnitViewModel) {
      uiStore.highlightedUnit = unit;
    },
    unhighlightUnit() {
      uiStore.highlightedUnit = null;
    },

    selectedUnit: computed(() =>
      uiStore.selectedUnitId
        ? (state.value.entities[uiStore.selectedUnitId] as UnitViewModel)
        : null
    ),
    selectUnit(unit: SerializedUnit) {
      uiStore.selectedUnitId = unit.id;
    },
    unselectUnit() {
      uiStore.selectedUnitId = null;
    }
  };
});
