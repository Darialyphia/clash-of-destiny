import type { Point } from '@game/shared';
import type { Game } from '../../game/game';
import type { Followup } from './ability-followup';
import type { SelectedTarget } from '../../game/systems/interaction.system';
import type { Cell } from '../../board/cell';
import type { AnyUnitCard } from '../entities/unit-card.entity';

export class SelfFollowup implements Followup<AnyUnitCard> {
  getTargets(game: Game, card: AnyUnitCard) {
    return [
      {
        type: 'cell' as const,
        isElligible(point: Point) {
          return card.unit.position.equals(point);
        }
      }
    ];
  }

  getRange(game: Game, card: AnyUnitCard): Cell[] {
    return [game.boardSystem.getCellAt(card.unit.position)!];
  }

  canCommit(targets: SelectedTarget[]) {
    return targets.length > 0;
  }
}
