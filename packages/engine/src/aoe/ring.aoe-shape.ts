import { isDefined } from '@game/shared';
import type { Point } from 'honeycomb-grid';
import type { Game } from '../game/game';
import type { Player } from '../player/player.entity';
import {
  type TargetingType,
  isValidTargetingType
} from '../targeting/targeting-strategy';
import type { AOEShape } from './aoe-shapes';

export type RingAOEShapeOptions = {
  targetingType: TargetingType;
  origin?: Point;
};

export class RingAOEShape implements AOEShape {
  constructor(
    private game: Game,
    private player: Player,
    private options: RingAOEShapeOptions
  ) {}

  getCells(points: Point[]) {
    return this.game.boardSystem.getNeighbors(this.options.origin ?? points[0]);
  }

  getUnits(points: Point[]) {
    return this.getCells(points)
      .filter(cell => {
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
