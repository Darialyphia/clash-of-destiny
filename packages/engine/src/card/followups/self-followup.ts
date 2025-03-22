import type { Point } from '@game/shared';
import type { Game } from '../../game/game';
import type { AbilityCard } from '../entities/ability-card.entity';
import type { AbilityFollowup } from './ability-followup';
import type { SelectedTarget } from '../../game/systems/interaction.system';
import type { Cell } from '../../board/cell';

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

  getRange(game: Game, card: AbilityCard): Cell[] {
    return [game.boardSystem.getCellAt(card.unit.position)!];
  }

  canCommit(targets: SelectedTarget[]) {
    return targets.length > 0;
  }
}
