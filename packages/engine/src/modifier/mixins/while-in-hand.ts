import { CARD_EVENTS } from '../../card/card.enums';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { ModifierMixin } from '../modifier-mixin';
import type { Modifier } from '../modifier.entity';

export class WhileInHanddModifierMixin extends ModifierMixin<AnyCard> {
  constructor(
    game: Game,
    private options: {
      onApplied: (modifier: Modifier<AnyCard>) => void;
      onRemoved: (modifier: Modifier<AnyCard>) => void;
    }
  ) {
    super(game);
  }

  onApplied(target: AnyCard, modifier: Modifier<AnyCard>): void {
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

  onRemoved(target: AnyCard, modifier: Modifier<AnyCard>): void {
    this.options.onRemoved(modifier);
  }

  onReapplied(): void {}
}
