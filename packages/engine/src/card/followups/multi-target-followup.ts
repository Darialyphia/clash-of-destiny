import type { Point } from '@game/shared';
import type { Game } from '../../game/game';
import type { Followup } from './ability-followup';
import type { EffectTarget, SelectedTarget } from '../../game/systems/interaction.system';
import type { Cell } from '../../board/cell';
import {
  isValidTargetingType,
  type TargetingType
} from '../../targeting/targeting-strategy';
import type { AnyCard } from '../entities/card.entity';

export class MultiTargetFollowup<T extends AnyCard> implements Followup<T> {
  constructor(
    private game: Game,
    private card: T,
    private followups: Followup<T>[]
  ) {
    this.canCommit = this.canCommit.bind(this);
  }

  getTargets(game: Game, card: T): EffectTarget[] {
    return this.followups
      .map(followup => {
        return followup.getTargets(game, card);
      })
      .flat();
  }

  getRange(game: Game, card: T, selectedTargets: SelectedTarget[]): Cell[] {
    let count = 0;

    for (const followup of this.followups) {
      const targets = followup.getTargets(game, card);
      count += targets.length;
      if (count < selectedTargets.length) {
        return followup.getRange(game, card, selectedTargets);
      }
    }

    return [];
  }

  canCommit(selectedTargets: SelectedTarget[]) {
    let count = 0;

    for (const followup of this.followups) {
      const targets = followup.getTargets(this.game, this.card);
      const startIndex = count;
      count += targets.length;

      if (count > selectedTargets.length) {
        const targetsForFollowup = selectedTargets.slice(startIndex, count);
        if (!followup.canCommit(targetsForFollowup)) {
          return false;
        }
      }
    }

    return true;
  }
}
