import { isDefined } from '@game/shared';
import type { DeckCard } from '../../card/entities/deck.entity';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/entities/unit.entity';
import { ModifierMixin } from '../modifier-mixin';
import type { Modifier, ModifierEventMap } from '../modifier.entity';

export class AddCardToHandModifierMixin extends ModifierMixin<Unit> {
  constructor(
    game: Game,
    private blueprintId: string
  ) {
    super(game);
  }

  onApplied(target: Unit, modifier: Modifier<Unit>): void {
    const copies = modifier.stacks;
    for (let i = 0; i < copies; i++) {
      const card = target.generateCard(this.blueprintId) as DeckCard;
      target.cards.addToHand(card);
    }
  }

  onRemoved(): void {
    return;
  }

  onReapplied(
    target: Unit,
    modifier: Modifier<Unit, ModifierEventMap>,
    stacks?: number,
    oldStacks?: number
  ): void {
    if (!isDefined(stacks) || !isDefined(oldStacks)) {
      return;
    }

    const copies = stacks - oldStacks;
    if (copies > 0) {
      for (let i = 0; i < copies; i++) {
        const card = target.generateCard(this.blueprintId) as DeckCard;
        target.cards.addToHand(card);
      }
    }
  }
}
