import { assert, isDefined, Vec2 } from '@game/shared';
import type { Point } from 'honeycomb-grid';
import type { Game } from '../game/game';
import type { Player } from '../player/player.entity';
import {
  type TargetingType,
  isValidTargetingType
} from '../targeting/targeting-strategy';
import type { AOEShape } from './aoe-shapes';
import { Position } from '../utils/position.component';

export type DiamondAOEShapeOptions = {
  targetingType: TargetingType;
  range: number;
  origin: Point;
};

export class ConeAOEShape implements AOEShape {
  constructor(
    private game: Game,
    private player: Player,
    private options: DiamondAOEShapeOptions
  ) {}

  getCells(points: Point[]) {
    assert(
      Position.fromPoint(this.options.origin).isAxisAligned(points[0]),
      'ConeAoeShape direction must be axis aligned with origin'
    );
    const direction = Vec2.sub(points[0], this.options.origin ?? points[0]);
    const cells: Point[] = [];

    for (let i = 0; i < this.options.range; i++) {
      const center = Vec2.fromPoint(points[0]).add(direction.clone().setMagnitude(i));
      cells.push(center);

      for (let j = 0; j < i; j++) {
        const offset = direction
          .clone()
          .rotate(90)
          .setMagnitude(j + 1);
        cells.push(center.clone().add(offset));
        cells.push(center.clone().sub(offset));
      }
    }

    return cells.map(cell => this.game.boardSystem.getCellAt(cell)).filter(isDefined);
  }

  getUnits(points: Point[]) {
    return this.getCells(points)
      .filter(cell => {
        if (!isDefined(cell.unit)) return false;
        return isValidTargetingType(
          this.game,
          cell,
          this.player,
          this.options.targetingType
        );
      })
      .map(cell => cell.unit)
      .filter(isDefined);
  }
}
