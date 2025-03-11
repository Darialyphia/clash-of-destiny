import { UnitViewModel } from '@/unit/unit.model';
import type { SerializedCell } from '@game/engine/src/board/cell';
import type { EntityDictionary } from '@game/engine/src/game/systems/game-snapshot.system';
import type { InputDispatcher } from '@game/engine/src/input/input-system';
import type { SerializedUnit } from '@game/engine/src/unit/entities/unit.entity';

export class CellViewModel {
  constructor(
    private data: SerializedCell,
    private entityDictionary: EntityDictionary,

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
    const unit = this.entityDictionary[this.data.unit];

    if (unit.entityType !== 'unit') {
      throw new Error('Expected unit');
    }

    return new UnitViewModel(unit, this.entityDictionary, this.dispatcher);
  }
}
