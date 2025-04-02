import type { Cell } from '../../board/cell';
import type { Game } from '../../game/game';
import type { EffectTarget, SelectedTarget } from '../../game/systems/interaction.system';
import type { AnyCard } from '../entities/card.entity';

export type Followup<T extends AnyCard> = {
  getTargets(game: Game, card: T): EffectTarget[];
  getRange(game: Game, card: T): Cell[];
  canCommit(targets: SelectedTarget[]): boolean;
};
