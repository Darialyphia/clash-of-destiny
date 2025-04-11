import type { GameStateEntities } from '@/battle/stores/battle.store';
import type { InteractableViewModel } from '@/interactable/interactable.model';
import { UnitViewModel } from '@/unit/unit.model';
import type { SerializedCell } from '@game/engine/src/board/cell';
import type { InputDispatcher } from '@game/engine/src/input/input-system';
import { objectEntries } from '@game/shared';

export class CellViewModel {
  private getEntities: () => GameStateEntities;

  constructor(
    private data: SerializedCell,
    entityDictionary: GameStateEntities,
    private dispatcher: InputDispatcher
  ) {
    this.getEntities = () => entityDictionary;
  }

  equals(cell: CellViewModel | SerializedCell) {
    return this.id === cell.id;
  }

  get id() {
    return this.data.id;
  }

  get position() {
    return this.data.position;
  }

  get spriteId() {
    return this.data.spriteId;
  }

  getUnit() {
    if (!this.data.unit) {
      return null;
    }

    return this.getEntities()[this.data.unit] as UnitViewModel;
  }

  getInteractable() {
    if (!this.data.interactable) {
      return null;
    }
    return this.getEntities()[this.data.interactable] as InteractableViewModel;
  }

  removeUnit() {
    this.data.unit = null;
  }

  addUnit(unit: UnitViewModel) {
    this.data.unit = unit.id;
  }
}
