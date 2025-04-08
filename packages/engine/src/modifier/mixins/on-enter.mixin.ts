import type { Modifier } from '../modifier.entity';
import { ModifierMixin } from '../modifier-mixin';
import { CARD_EVENTS } from '../../card/card.enums';
import type { Game } from '../../game/game';
import { UNIT_EVENTS } from '../../unit/unit-enums';
import type { UnitCreatedEvent } from '../../unit/unit.events';
import { UnitCard, type AnyUnitCard } from '../../card/entities/unit-card.entity';
import { ArtifactCard } from '../../card/entities/artifact-card.entity';
import { ARTIFACT_EVENTS, ArtifactEquipedEvent } from '../../player/artifact.entity';

export class OnEnterModifierMixin<
  T extends AnyUnitCard | ArtifactCard
> extends ModifierMixin<T> {
  private modifier!: Modifier<T>;
  constructor(
    game: Game,
    private handler: (
      event: T extends AnyUnitCard ? UnitCreatedEvent : ArtifactEquipedEvent
    ) => void
  ) {
    super(game);
    this.onBeforePlay = this.onBeforePlay.bind(this);
  }

  onBeforePlay() {
    const target = this.modifier.target;
    console.log('on before play');
    if (target instanceof UnitCard) {
      target.unit.once(UNIT_EVENTS.CREATED, event => {
        if (target.player.currentlyPlayedCard?.equals(this.modifier.target)) {
          this.handler(event as any);
        }
      });
    } else if (target instanceof ArtifactCard) {
      target.artifact.once(ARTIFACT_EVENTS.EQUIPED, event => {
        if (
          this.modifier.target.player.currentlyPlayedCard?.equals(this.modifier.target)
        ) {
          this.handler(event as any);
        }
      });
    }
  }

  onApplied(card: T, modifier: Modifier<T>): void {
    this.modifier = modifier;
    this.modifier.target.on(CARD_EVENTS.BEFORE_PLAY, this.onBeforePlay);
  }

  onRemoved(): void {
    this.modifier.target.off(CARD_EVENTS.BEFORE_PLAY, this.onBeforePlay);
  }

  onReapplied(): void {}
}
