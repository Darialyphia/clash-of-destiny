import type { Point } from '@game/shared';
import type { Game } from '../../game/game';
import type { Followup } from './ability-followup';
import type { SelectedTarget } from '../../game/systems/interaction.system';
import {
  isValidTargetingType,
  type TargetingType
} from '../../targeting/targeting-strategy';
import type { Cell } from '../../board/cell';
import { Position } from '../../utils/position.component';
import type { AnyCard } from '../entities/card.entity';

export class RangedFollowup implements Followup<AnyCard> {
  private position: Position;
  constructor(
    private options: {
      minRange: number;
      maxRange: number;
      targetsCount?: number;
      allowSelf?: boolean;
      targetingType: TargetingType;
      position: Point;
    }
  ) {
    this.position = Position.fromPoint(this.options.position);
    this.canCommit = this.canCommit.bind(this);
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

          if (!this.options.allowSelf && this.position.equals(point)) {
            return false;
          }
          const distance = this.position.dist(point);

          return distance >= this.options.minRange && distance <= this.options.maxRange;
        }
      }
    ];
  }

  getRange(game: Game): Cell[] {
    return game.boardSystem.cells.filter(cell => {
      if (!this.options.allowSelf && this.position.equals(cell.position)) {
        return false;
      }

      const distance = this.position.dist(cell);

      return distance >= this.options.minRange && distance <= this.options.maxRange;
    });
  }

  canCommit(targets: SelectedTarget[]) {
    return targets.length >= (this.options.targetsCount ?? 1);
  }
}
