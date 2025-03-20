import type { Point } from '@game/shared';
import type { Game } from '../../game/game';
import type { AbilityCard } from '../entities/ability-card.entity';
import type { AbilityFollowup } from './ability-followup';
import type { SelectedTarget } from '../../game/systems/interaction.system';

export class MeleeFollowup implements AbilityFollowup {
  constructor(private options: { allowDiagonals: boolean }) {}

  getTargets(game: Game, card: AbilityCard) {
    return [
      {
        type: 'cell' as const,
        isElligible: (point: Point) => {
          if (this.options.allowDiagonals) {
            return card.unit.position.isNearby(point);
          } else {
            return (
              card.unit.position.isNearby(point) &&
              card.unit.position.isAxisAligned(point)
            );
          }
        }
      }
    ];
  }

  canCommit(targets: SelectedTarget[]) {
    return targets.length > 0;
  }
}
