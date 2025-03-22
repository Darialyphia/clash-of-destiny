import type { Point } from '@game/shared';
import type { Game } from '../../game/game';
import type { AbilityCard } from '../entities/ability-card.entity';
import type { AbilityFollowup } from './ability-followup';
import type { SelectedTarget } from '../../game/systems/interaction.system';
import {
  isValidTargetingType,
  type TargetingType
} from '../../targeting/targeting-strategy';
import type { Cell } from '../../board/cell';

export class ProjectileFollowup implements AbilityFollowup {
  constructor(private targetingType: TargetingType) {}

  getTargets(game: Game, card: AbilityCard) {
    return [
      {
        type: 'cell' as const,
        isElligible: (point: Point) => {
          if (!isValidTargetingType(game, point, card.unit.player, this.targetingType)) {
            return false;
          }

          return card.unit.position.isAxisAligned(point);
        }
      }
    ];
  }

  getRange(game: Game, card: AbilityCard): Cell[] {
    return game.boardSystem.cells.filter(cell => card.unit.position.isAxisAligned(cell));
  }

  canCommit(targets: SelectedTarget[]) {
    return targets.length > 0;
  }
}
