import type { Game } from '../../game/game';
import type { EffectTarget, SelectedTarget } from '../../game/systems/interaction.system';
import type { AbilityCard } from '../entities/ability-card.entity';

export type AbilityFollowup = {
  getTargets(game: Game, card: AbilityCard): EffectTarget[];
  canCommit(targets: SelectedTarget[]): boolean;
};
