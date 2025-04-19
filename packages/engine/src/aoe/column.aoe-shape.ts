import { isDefined } from '@game/shared';
import type { Point } from 'honeycomb-grid';
import type { Game } from '../game/game';
import type { Player } from '../player/player.entity';
import {
  type TargetingType,
  isValidTargetingType
} from '../targeting/targeting-strategy';
import type { AOEShape } from './aoe-shapes';

export type ColumnAOEShapeOptions = {
  targetingType: TargetingType;
};

export class ColumnAOEShape implements AOEShape {
  constructor(
    private game: Game,
    private player: Player,
    private options: ColumnAOEShapeOptions
  ) {}

  getCells(points: Point[]) {
    return this.game.boardSystem.cells.filter(cell => cell.y === points[0].x);
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
