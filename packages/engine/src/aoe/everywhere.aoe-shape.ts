import { isDefined } from '@game/shared';
import type { Cell } from '../board/cell';
import type { Game } from '../game/game';
import {
  type TargetingType,
  isValidTargetingType
} from '../targeting/targeting-strategy';
import type { Unit } from '../unit/entities/unit.entity';
import type { AOEShape } from './aoe-shapes';
import type { Player } from '../player/player.entity';

export class EverywhereAOEShape implements AOEShape {
  constructor(
    private game: Game,
    private player: Player,
    private type: TargetingType
  ) {}

  getCells(): Cell[] {
    return this.game.boardSystem.cells;
  }

  getUnits(): Unit[] {
    return this.getCells()
      .map(cell => cell.unit)
      .filter((unit): unit is Unit => {
        if (!isDefined(unit)) return false;

        return isValidTargetingType(this.game, unit.position, this.player, this.type);
      });
  }
}
