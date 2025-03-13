import { assert, isDefined, Vec2 } from '@game/shared';
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

export class ProjectileAOEShape implements AOEShape {
  constructor(
    private game: Game,
    private player: Player,
    private origin: Point,
    private type: TargetingType = TARGETING_TYPE.ANYWHERE
  ) {}

  getCells(points: Point[]) {
    const direction = Vec2.fromPoint(points[0]);
    direction.sub(this.origin);
    direction.magnitude = 1;

    const end = this.game.unitSystem.getClosest(this.origin, direction);
    if (!end) return [];

    return bresenham(this.origin, end.position)
      .map(point => this.game.boardSystem.getCellAt(point))
      .filter(isDefined)
      .filter(cell => !cell.position.equals(this.origin));
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
