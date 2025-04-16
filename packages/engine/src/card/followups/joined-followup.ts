import type { Point } from '@game/shared';
import type { Cell } from '../../board/cell';
import type { Game } from '../../game/game';
import type { EffectTarget, SelectedTarget } from '../../game/systems/interaction.system';
import { Position } from '../../utils/position.component';
import type { Followup } from './ability-followup';
import type { TargetingStrategy } from '../../targeting/targeting-strategy';
import type { SpellCard } from '../entities/spell-card.entity';

export class JoinedFollowup implements Followup<SpellCard> {
  constructor(
    private options: { max: number; originTargetingStrategy: TargetingStrategy }
  ) {
    this.canCommit = this.canCommit.bind(this);
  }

  getTargets(): EffectTarget[] {
    return [
      {
        type: 'cell',
        isElligible: point => {
          return this.options.originTargetingStrategy.canTargetAt(point);
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ...Array.from({ length: this.options.max - 1 }, (_, i) => ({
        type: 'cell' as const,
        isElligible: (point: Point, targets: SelectedTarget[]) => {
          return targets.some(target => Position.fromPoint(target.cell).isNearby(point));
        }
      }))
    ];
  }
  getRange(game: Game): Cell[] {
    return game.boardSystem.cells.filter(cell => {
      return this.options.originTargetingStrategy.canTargetAt(cell);
    });
  }

  canCommit(targets: SelectedTarget[]): boolean {
    return targets.length >= this.options.max;
  }
}
