import type { Point } from '@game/shared';
import type { Game } from '../../game/game';
import type { AbilityCard } from '../entities/ability-card.entity';
import type { AbilityFollowup } from './ability-followup';
import type { SelectedTarget } from '../../game/systems/interaction.system';

export class RangedFollowup implements AbilityFollowup {
  constructor(
    private options: {
      minRange: number;
      maxRange: number;
      targetsCount?: number;
      allowSelf?: boolean;
    }
  ) {
    this.canCommit = this.canCommit.bind(this);
  }

  getTargets(game: Game, card: AbilityCard) {
    return [
      {
        type: 'cell' as const,
        isElligible: (point: Point) => {
          if (!this.options.allowSelf && card.unit.position.equals(point)) {
            return false;
          }
          const distance = card.unit.position.dist(point);

          return distance >= this.options.minRange && distance <= this.options.maxRange;
        }
      }
    ];
  }

  canCommit(targets: SelectedTarget[]) {
    return targets.length >= (this.options.targetsCount ?? 1);
  }
}
