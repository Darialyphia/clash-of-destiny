import { type Point3D } from '@game/shared';
import {
  isValidTargetingType,
  type TargetingStrategy,
  type TargetingType
} from './targeting-strategy';
import type { Game } from '../game/game';
import type { Player } from '../player/player.entity';
import { Position } from '../utils/position.component';

export class NearbyTargetingStrategy implements TargetingStrategy {
  constructor(
    private game: Game,
    private player: Player,
    private origins: [Point3D],
    private type: TargetingType
  ) {}

  isWithinRange(point: Point3D) {
    return this.origins.some(origin => Position.fromPoint(origin).isNearby(point));
  }

  canTargetAt(point: Point3D) {
    if (!this.isWithinRange(point)) return false;

    return isValidTargetingType(this.game, point, this.player, this.type);
  }
}
