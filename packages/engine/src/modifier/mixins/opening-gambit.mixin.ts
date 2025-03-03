import type { Modifier } from '../modifier.entity';
import { ModifierMixin } from '../modifier-mixin';
import { CARD_EVENTS } from '../../card/card.enums';
import type { UnitCard } from '../../card/entities/unit-card.entity';
import type { Game } from '../../game/game';
import { UNIT_EVENTS } from '../../unit/unit-enums';
import type { UnitCreatedEvent } from '../../unit/unit.events';

export class OpeningGambitModifierMixin extends ModifierMixin<UnitCard> {
  private modifier!: Modifier<UnitCard>;
  constructor(
    game: Game,
    private handler: (event: UnitCreatedEvent) => void
  ) {
    super(game);
    this.onBeforePlay = this.onBeforePlay.bind(this);
  }

  onBeforePlay() {
    this.modifier.target.unit.once(UNIT_EVENTS.CREATED, event => {
      if (this.modifier.target.unit.currentlyPlayedCard?.equals(this.modifier.target)) {
        this.handler(event);
      }
    });
  }

  onApplied(card: UnitCard, modifier: Modifier<UnitCard>): void {
    this.modifier = modifier;
    this.modifier.target.on(CARD_EVENTS.BEFORE_PLAY, this.onBeforePlay);
  }

  onRemoved(): void {
    this.modifier.target.off(CARD_EVENTS.BEFORE_PLAY, this.onBeforePlay);
  }

  onReapplied(): void {}
}
