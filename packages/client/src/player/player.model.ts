import type { GameStateEntities } from '@/battle/stores/battle.store';
import { CellViewModel } from '@/board/cell.model';
import type { UnitViewModel } from '@/unit/unit.model';
import type { InputDispatcher } from '@game/engine/src/input/input-system';
import type { SerializedPlayer } from '@game/engine/src/player/player.entity';
import type { Unit } from '@game/engine/src/unit/entities/unit.entity';

export class PlayerViewModel {
  constructor(
    private data: SerializedPlayer,
    private entityDictionary: GameStateEntities,
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
      return this.entityDictionary[cellId] as CellViewModel;
    });
  }

  deploy() {
    this.dispatcher({
      type: 'deploy',
      payload: {
        playerId: this.id,
        deployment: this.data.heroes.map(heroId => {
          const hero = this.entityDictionary[heroId] as UnitViewModel;
          return {
            heroId: heroId,
            ...hero.position
          };
        })
      }
    });
  }
}
