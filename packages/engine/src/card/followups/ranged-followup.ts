import { isFunction, type Point } from '@game/shared';
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
  private position: Point | ((targets: SelectedTarget[]) => Point);
  constructor(
    private options: {
      minRange: number;
      maxRange: number;
      targetsCount?: number;
      allowSelf?: boolean;
      targetingType: TargetingType;
      position: Point | ((targets: SelectedTarget[]) => Point);
    }
  ) {
    this.position = this.options.position;
    this.canCommit = this.canCommit.bind(this);
  }

  getTargets(game: Game, card: AnyCard) {
    return [
      {
        type: 'cell' as const,
        isElligible: (point: Point, selectedTargets: SelectedTarget[]) => {
          if (
            !isValidTargetingType(game, point, card.player, this.options.targetingType)
          ) {
            return false;
          }

          const position = Position.fromPoint(
            isFunction(this.position) ? this.position(selectedTargets) : this.position
          );
          if (!this.options.allowSelf && position.equals(point)) {
            return false;
          }
          const distance = position.dist(point);

          return distance >= this.options.minRange && distance <= this.options.maxRange;
        }
      }
    ];
  }

  getRange(game: Game, card: AnyCard, selectedTargets: SelectedTarget[]): Cell[] {
    const position = Position.fromPoint(
      isFunction(this.position) ? this.position(selectedTargets) : this.position
    );
    return game.boardSystem.cells.filter(cell => {
      if (!this.options.allowSelf && position.equals(cell.position)) {
        return false;
      }

      const distance = position.dist(cell);

      return distance >= this.options.minRange && distance <= this.options.maxRange;
    });
  }

  canCommit(targets: SelectedTarget[]) {
    return targets.length >= (this.options.targetsCount ?? 1);
  }
}
