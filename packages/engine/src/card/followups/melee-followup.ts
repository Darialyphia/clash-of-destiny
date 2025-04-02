import type { Point } from '@game/shared';
import type { Game } from '../../game/game';
import type { Followup } from './ability-followup';
import type { SelectedTarget } from '../../game/systems/interaction.system';
import type { Cell } from '../../board/cell';
import {
  isValidTargetingType,
  type TargetingType
} from '../../targeting/targeting-strategy';
import type { AnyCard } from '../entities/card.entity';
import { Position } from '../../utils/position.component';

export class MeleeFollowup implements Followup<AnyCard> {
  private position: Position;
  constructor(
    private options: {
      position: Point;
      allowDiagonals: boolean;
      targetingType: TargetingType;
    }
  ) {
    this.position = Position.fromPoint(this.options.position);
  }

  getTargets(game: Game, card: AnyCard) {
    return [
      {
        type: 'cell' as const,
        isElligible: (point: Point) => {
          if (
            !isValidTargetingType(game, point, card.player, this.options.targetingType)
          ) {
            return false;
          }

          if (this.options.allowDiagonals) {
            return this.position.isNearby(point);
          } else {
            return this.position.isNearby(point) && this.position.isAxisAligned(point);
          }
        }
      }
    ];
  }

  getRange(game: Game): Cell[] {
    return game.boardSystem.cells.filter(cell => {
      if (this.options.allowDiagonals) {
        return this.position.isNearby(cell);
      } else {
        return this.position.isNearby(cell) && this.position.isAxisAligned(cell);
      }
    });
  }

  canCommit(targets: SelectedTarget[]) {
    return targets.length > 0;
  }
}
