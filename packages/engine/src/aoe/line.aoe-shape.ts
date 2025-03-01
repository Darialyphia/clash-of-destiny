import { assert, isDefined } from '@game/shared';
import type { Point } from 'honeycomb-grid';
import type { Game } from '../game/game';
import type { Player } from '../player/player.entity';
import {
  type TargetingType,
  TARGETING_TYPE,
  isValidTargetingType
} from '../targeting/targeting-strategy';
import type { Unit } from '../unit/entities/unit.entity';
import type { AOEShape } from './aoe-shapes';
import { bresenham } from '../utils/bresenham';

export class LineAOEShape implements AOEShape {
  constructor(
    private game: Game,
    private player: Player,
    private origin: Point,
    private type: TargetingType = TARGETING_TYPE.ANYWHERE
  ) {}

  getCells(points: Point[]) {
    return bresenham(this.origin, points[0])
      .map(point => this.game.boardSystem.getCellAt(point))
      .filter(isDefined);
  }

  getUnits(points: Point[]): Unit[] {
    return this.getCells(points)
      .filter(cell => {
        if (!isDefined(cell.unit)) return false;
        return isValidTargetingType(this.game, cell, this.player, this.type);
      })
      .map(cell => cell.unit)
      .filter(isDefined);
  }
}
