import type { Point } from '@game/shared';
import type { Game } from '../../game/game';
import type { AbilityCard } from '../entities/ability-card.entity';
import type { AbilityFollowup } from './ability-followup';
import type { SelectedTarget } from '../../game/systems/interaction.system';

export class SelfFollowup implements AbilityFollowup {
  getTargets(game: Game, card: AbilityCard) {
    return [
      {
        type: 'cell' as const,
        isElligible(point: Point) {
          return card.unit.position.equals(point);
        }
      }
    ];
  }

  canCommit(targets: SelectedTarget[]) {
    return targets.length > 0;
  }
}
