import { CARD_EVENTS } from '../../card/card.enums';
import type { DeckCard } from '../../card/entities/deck.entity';
import type { Game } from '../../game/game';
import { ModifierMixin } from '../modifier-mixin';
import type { Modifier } from '../modifier.entity';

export class WhileInHanddModifierMixin extends ModifierMixin<DeckCard> {
  constructor(
    game: Game,
    private options: {
      onApplied: (modifier: Modifier<DeckCard>) => void;
      onRemoved: (modifier: Modifier<DeckCard>) => void;
    }
  ) {
    super(game);
  }

  onApplied(target: DeckCard, modifier: Modifier<DeckCard>): void {
    target.on(CARD_EVENTS.ADD_TO_HAND, () => {
      this.options.onApplied(modifier);
    });

    [(CARD_EVENTS.DISCARD, CARD_EVENTS.AFTER_PLAY, CARD_EVENTS.REPLACE)].forEach(
      event => {
        target.once(event, () => {
          this.options.onRemoved(modifier);
        });
      }
    );
  }

  onRemoved(target: DeckCard, modifier: Modifier<DeckCard>): void {
    this.options.onRemoved(modifier);
  }

  onReapplied(): void {}
}
