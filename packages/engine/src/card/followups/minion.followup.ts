import type { Cell } from '../../board/cell';
import type { Game } from '../../game/game';
import type { EffectTarget, SelectedTarget } from '../../game/systems/interaction.system';
import { UnitSummonTargetingtrategy } from '../../targeting/unit-summon-targeting.strategy';
import type { AnyUnitCard } from '../entities/unit-card.entity';
import type { Followup } from './ability-followup';

export class MinionFollowup implements Followup<AnyUnitCard> {
  constructor(private otherTargets?: EffectTarget[]) {}
  getTargets(game: Game, card: AnyUnitCard): EffectTarget[] {
    return [
      {
        type: 'cell',
        isElligible(point) {
          return new UnitSummonTargetingtrategy(game, card).canTargetAt(point);
        }
      },
      ...(this.otherTargets ?? [])
    ];
  }
  getRange(game: Game, card: AnyUnitCard): Cell[] {
    const strategy = new UnitSummonTargetingtrategy(game, card);

    return game.boardSystem.cells.filter(cell => {
      return strategy.canTargetAt(cell);
    });
  }

  canCommit(targets: SelectedTarget[]): boolean {
    return targets.length > 0;
  }
}
