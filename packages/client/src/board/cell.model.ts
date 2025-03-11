import type { GameStateEntities } from '@/battle/stores/battle.store';
import { UnitViewModel } from '@/unit/unit.model';
import type { SerializedCell } from '@game/engine/src/board/cell';
import type { InputDispatcher } from '@game/engine/src/input/input-system';

export class CellViewModel {
  constructor(
    private data: SerializedCell,
    private entityDictionary: GameStateEntities,

    private dispatcher: InputDispatcher
  ) {}

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
    return this.entityDictionary[this.data.unit] as UnitViewModel;
  }
}
