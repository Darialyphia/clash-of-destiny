import { CellViewModel } from '@/board/cell.model';
import type { EntityDictionary } from '@game/engine/src/game/systems/game-snapshot.system';
import type { InputDispatcher } from '@game/engine/src/input/input-system';
import type { SerializedPlayer } from '@game/engine/src/player/player.entity';

export class PlayerViewModel {
  constructor(
    private data: SerializedPlayer,
    private entityDictionary: EntityDictionary,
    private dispatcher: InputDispatcher
  ) {}

  equals(unit: PlayerViewModel | SerializedPlayer) {
    return this.id === unit.id;
  }

  get id() {
    return this.data.id;
  }

  getDeployZone() {
    return this.data.deployZone.map(cellId => {
      const cell = this.entityDictionary[cellId];

      if (cell.entityType !== 'cell') {
        throw new Error('Expected cell');
      }

      return new CellViewModel(cell, this.entityDictionary, this.dispatcher);
    });
  }
}
