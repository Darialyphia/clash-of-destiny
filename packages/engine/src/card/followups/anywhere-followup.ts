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

export class AnywhereFollowup implements Followup<AnyCard> {
  constructor(
    private options: {
      targetingType: TargetingType;
      skippable?: boolean;
      filter?: (point: Point) => boolean;
    }
  ) {
    this.canCommit = this.canCommit.bind(this);
  }

  getTargets(game: Game, card: AnyCard) {
    return [
      {
        type: 'cell' as const,
        isElligible: (point: Point) => {
          const isValid = isValidTargetingType(
            game,
            point,
            card.player,
            this.options.targetingType
          );
          if (!this.options.filter) return isValid;

          return isValid && this.options.filter(point);
        }
      }
    ];
  }

  getRange(game: Game): Cell[] {
    return game.boardSystem.cells;
  }

  canCommit(targets: SelectedTarget[]) {
    if (this.options.skippable) {
      return true;
    }
    return targets.length > 0;
  }
}
