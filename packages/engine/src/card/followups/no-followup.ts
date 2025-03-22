import type { AbilityFollowup } from './ability-followup';

export class NoFollowup implements AbilityFollowup {
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
