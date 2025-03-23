import { isDefined } from '@game/shared';
import type { Point } from 'honeycomb-grid';
import type { Game } from '../game/game';
import type { Player } from '../player/player.entity';
import {
  type TargetingType,
  isValidTargetingType
} from '../targeting/targeting-strategy';
import type { AOEShape } from './aoe-shapes';

export type BoxAOEShapeOptions = {
  targetingType: TargetingType;
  width: number;
  height: number;
  origin: 'center' | 'topLeft';
};

export class BoxAOEShape implements AOEShape {
  constructor(
    private game: Game,
    private player: Player,
    private options: BoxAOEShapeOptions
  ) {}

  private getCellsFromTopLeft(topLeft: Point) {
    return this.game.boardSystem.cells.filter(
      cell =>
        cell.position.x >= topLeft.x &&
        cell.position.x < topLeft.x + this.options.width &&
        cell.position.y >= topLeft.y &&
        cell.position.y < topLeft.y + this.options.height
    );
  }

  getCells(points: Point[]) {
    const origin = points[0];
    if (this.options.origin === 'center') {
      const topLeft = {
        x: origin.x - Math.floor(this.options.width / 2),
        y: origin.y - Math.floor(this.options.height / 2)
      };
      return this.getCellsFromTopLeft(topLeft);
    } else {
      return this.getCellsFromTopLeft(origin);
    }
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
