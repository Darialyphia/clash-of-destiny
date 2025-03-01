import { isDefined } from '@game/shared';
import type { Point } from 'honeycomb-grid';
import type { Game } from '../game/game';
import {
  type NonEmptyTargetingType,
  isValidTargetingType
} from '../targeting/targeting-strategy';
import type { Unit } from '../unit/entities/unit.entity';
import type { AOEShape } from './aoe-shapes';

export type IntersectiongAOEShapeOptions = {
  targetingType: NonEmptyTargetingType;
};
export class IntersectionAoeShape implements AOEShape {
  constructor(
    private game: Game,
    private unit: Unit,
    private options: IntersectiongAOEShapeOptions
  ) {}

  getCells(points: Point[]) {
    const selfNeighbors = this.game.boardSystem.getNeighbors(this.unit.position);
    const pointNeighbors = this.game.boardSystem.getNeighbors(points[0]);

    return selfNeighbors.filter(cell => pointNeighbors.some(other => other.equals(cell)));
  }

  getUnits(points: Point[]) {
    return this.getCells(points)
      .map(cell => cell.unit)
      .filter((unit): unit is Unit => {
        if (!isDefined(unit)) return false;

        return isValidTargetingType(
          this.game,
          unit.position,
          this.unit.player,
          this.options.targetingType
        );
      });
  }
}
