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

export class RangedFollowup implements AbilityFollowup {
  constructor(
    private options: {
      minRange: number;
      maxRange: number;
      targetsCount?: number;
      allowSelf?: boolean;
      targetingType: TargetingType;
    }
  ) {
    this.canCommit = this.canCommit.bind(this);
  }

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

          if (!this.options.allowSelf && card.unit.position.equals(point)) {
            return false;
          }
          const distance = card.unit.position.dist(point);

          return distance >= this.options.minRange && distance <= this.options.maxRange;
        }
      }
    ];
  }

  getRange(game: Game, card: AbilityCard): Cell[] {
    return game.boardSystem.cells.filter(cell => {
      if (!this.options.allowSelf && card.unit.position.equals(cell.position)) {
        return false;
      }

      const distance = card.unit.position.dist(cell);

      return distance >= this.options.minRange && distance <= this.options.maxRange;
    });
  }

  canCommit(targets: SelectedTarget[]) {
    return targets.length >= (this.options.targetsCount ?? 1);
  }
}
