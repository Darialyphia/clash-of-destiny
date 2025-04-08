import type { AnyCard } from '../entities/card.entity';
import type { Followup } from './ability-followup';

export class NoFollowup implements Followup<AnyCard> {
  getTargets() {
    return [];
  }

  getRange() {
    return [];
  }
  canCommit() {
    return true;
  }
}
