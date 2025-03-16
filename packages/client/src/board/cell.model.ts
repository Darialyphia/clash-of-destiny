import type { GameStateEntities } from '@/battle/stores/battle.store';
import type { InteractableViewModel } from '@/interactable/interactable.model';
import type { PlayerViewModel } from '@/player/player.model';
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

  getPlayer() {
    if (!this.data.player) {
      return null;
    }
    return this.entityDictionary[this.data.player] as PlayerViewModel;
  }

  getInteractable() {
    if (!this.data.interactable) {
      return null;
    }
    return this.entityDictionary[
      this.data.interactable
    ] as InteractableViewModel;
  }

  removeUnit() {
    this.data.unit = null;
  }

  addUnit(unit: UnitViewModel) {
    this.data.unit = unit.id;
  }
}
