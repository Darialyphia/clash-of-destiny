import type { Point } from '@game/shared';
import type { Game } from '../../game/game';
import type { AbilityCard } from '../entities/ability-card.entity';
import type { AbilityFollowup } from './ability-followup';
import type { SelectedTarget } from '../../game/systems/interaction.system';
import type { Cell } from '../../board/cell';
import {
  isValidTargetingType,
  type TargetingType
} from '../../targeting/targeting-strategy';

export class MeleeFollowup implements AbilityFollowup {
  constructor(
    private options: { allowDiagonals: boolean; targetingType: TargetingType }
  ) {}

  getTargets(game: Game, card: AbilityCard) {
    return [
      {
        type: 'cell' as const,
        isElligible: (point: Point) => {
          if (
            !isValidTargetingType(
              game,
              point,
              card.unit.player,
              this.options.targetingType
            )
          ) {
            return false;
          }

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

  getRange(game: Game, card: AbilityCard): Cell[] {
    return game.boardSystem.cells.filter(cell => {
      if (this.options.allowDiagonals) {
        return card.unit.position.isNearby(cell);
      } else {
        return (
          card.unit.position.isNearby(cell) && card.unit.position.isAxisAligned(cell)
        );
      }
    });
  }

  canCommit(targets: SelectedTarget[]) {
    return targets.length > 0;
  }
}
