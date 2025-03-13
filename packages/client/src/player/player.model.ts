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

  get name() {
    return this.data.name;
  }

  get hasDeployed() {
    return this.data.hasCommitedDeployment;
  }

  getDeployZone() {
    return this.data.deployZone.map(cellId => {
      return this.entityDictionary[cellId] as CellViewModel;
    });
  }

  getHeroes() {
    return this.data.heroes.map(heroId => {
      return this.entityDictionary[heroId] as UnitViewModel;
    });
  }

  getOpponent() {
    const entity = Object.values(this.entityDictionary).find(
      entity => entity instanceof PlayerViewModel && entity.id !== this.id
    );
    return entity as PlayerViewModel;
  }

  commitDeployment() {
    this.dispatcher({
      type: 'commitDeployment',
      payload: {
        playerId: this.id
      }
    });
  }
}
