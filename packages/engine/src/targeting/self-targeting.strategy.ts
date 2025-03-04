import { type Point3D } from '@game/shared';
import type { TargetingStrategy } from './targeting-strategy';
import type { Unit } from '../unit/entities/unit.entity';

export class SelfTargetingStrategy implements TargetingStrategy {
  constructor(private unit: Unit) {}

  isWithinRange(point: Point3D) {
    return this.unit.position.equals(point);
  }

  canTargetAt(point: Point3D) {
    return this.isWithinRange(point);
  }
}
