import { type Point } from '@game/shared';
import type { TargetingStrategy } from './targeting-strategy';
import type { Game } from '../game/game';
import type { AnyUnitCard } from '../card/entities/unit-card.entity';

export class UnitSummonTargetingtrategy implements TargetingStrategy {
  constructor(
    private game: Game,
    private card: AnyUnitCard
  ) {}

  isWithinRange(point: Point) {
    return this.card.canPlayAt(point);
  }

  canTargetAt(point: Point) {
    return this.card.canPlayAt(point);
  }
}
