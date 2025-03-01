import { type Point } from '@game/shared';
import {
  isValidTargetingType,
  type TargetingStrategy,
  type TargetingType
} from './targeting-strategy';
import type { Unit } from '../unit/entities/unit.entity';
import type { Game } from '../game/game';

export class BlasTargetingStrategy implements TargetingStrategy {
  constructor(
    private game: Game,
    private unit: Unit,
    private type: TargetingType
  ) {}

  isBlastTarget(point: Point) {
    return this.unit.position.isAxisAligned(point);
  }
  isWithinRange(point: Point) {
    return this.isBlastTarget(point) || this.unit.position.isNearby(point);
  }

  canTargetAt(point: Point) {
    if (!this.isWithinRange(point)) return false;
    const unit = this.game.unitSystem.getUnitAt(point);
    if (!unit) return false;

    return isValidTargetingType(this.game, point, this.unit.player, this.type);
  }
}
