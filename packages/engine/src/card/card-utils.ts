import type { Game } from '../game/game';
import type { EffectTarget } from '../game/systems/interaction.system';
import { UnitSummonTargetingtrategy } from '../targeting/unit-summon-targeting.strategy';
import type { UnitBlueprint } from './card-blueprint';
import type { UnitCard } from './entities/unit-card.entity';

export const minionFollowup = (
  otherTargets?: (game: Game, card: UnitCard) => EffectTarget[]
): UnitBlueprint['followup'] => {
  return {
    getTargets(game, card) {
      return [
        {
          type: 'cell',
          isElligible(point) {
            return new UnitSummonTargetingtrategy(game, card).canTargetAt(point);
          }
        },
        ...(otherTargets?.(game, card) ?? [])
      ];
    },
    canCommit() {
      return true;
    }
  };
};
