import { isDefined } from '@game/shared';
import type { Point } from 'honeycomb-grid';
import type { Game } from '../game/game';
import type { Player } from '../player/player.entity';
import {
  type TargetingType,
  isValidTargetingType
} from '../targeting/targeting-strategy';
import type { AOEShape } from './aoe-shapes';

export type CircleAOEShapeOptions = {
  allow3D: boolean;
  targetingType: TargetingType;
  range: number;
};

export class CircleAOEShape implements AOEShape {
  constructor(
    private game: Game,
    private player: Player,
    private options: CircleAOEShapeOptions
  ) {}

  getCells(points: Point[]) {
    return this.game.boardSystem.cells.filter(cell =>
      cell.position.isWithinCells(points[0], this.options.range)
    );
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
