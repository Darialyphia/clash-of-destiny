import type { Keyword } from '../../card/card-keyword';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/entities/unit.entity';
import { ModifierMixin } from '../modifier-mixin';

export class KeywordModifierMixin<T extends Unit | AnyCard> extends ModifierMixin<T> {
  constructor(
    game: Game,
    private keyword: Keyword
  ) {
    super(game);
  }

  onApplied(target: T): void {
    target.addKeyword(this.keyword);
  }

  onRemoved(target: T): void {
    target.removeKeyword(this.keyword);
  }

  onReapplied(): void {}
}
