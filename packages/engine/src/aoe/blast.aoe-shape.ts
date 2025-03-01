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
import { Position } from '../utils/position.component';
import { LineAOEShape } from './line.aoe-shape';
import { PointAOEShape } from './point.aoe-shape';

export class BlastAOEShape implements AOEShape {
  constructor(
    private game: Game,
    private unit: Unit,
    private type: TargetingType = TARGETING_TYPE.ANYWHERE
  ) {}

  getCells(points: Point[]) {
    const position = Position.fromPoint(points[0]);
    if (!position.isAxisAligned(this.unit)) {
      return new PointAOEShape(this.game, this.unit.player, this.type).getCells(points);
    }

    return this.game.boardSystem.cells.filter(cell => {
      if (position.y === this.unit.y) {
        if (position.x > this.unit.x) {
          return cell.x > this.unit.x;
        } else {
          return cell.x < this.unit.x;
        }
      }
      if (position.x === this.unit.x) {
        if (position.y > this.unit.y) {
          return cell.y > this.unit.y;
        } else {
          return cell.y < this.unit.y;
        }
      }
      return false;
    });
  }

  getUnits(points: Point[]): Unit[] {
    return this.getCells(points)
      .filter(cell => {
        if (!isDefined(cell.unit)) return false;
        return isValidTargetingType(this.game, cell, this.unit.player, this.type);
      })
      .map(cell => cell.unit)
      .filter(isDefined);
  }
}
