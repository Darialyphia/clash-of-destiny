import { KEYWORDS } from '../../card/card-keyword';
import type { ArtifactCard } from '../../card/entities/artifact-card.entity';
import type { AnyCard } from '../../card/entities/card.entity';
import type { AnyUnitCard } from '../../card/entities/unit-card.entity';
import type { Game } from '../../game/game';
import type { ArtifactEquipedEvent } from '../../player/artifact.entity';
import type { UnitCreatedEvent } from '../../unit/unit.events';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { OnEnterModifierMixin } from '../mixins/on-enter.mixin';
import { Modifier } from '../modifier.entity';

export class OnEnterModifier<T extends AnyUnitCard | ArtifactCard> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    handler: (
      event: T extends AnyUnitCard ? UnitCreatedEvent : ArtifactEquipedEvent
    ) => void
  ) {
    super(KEYWORDS.ON_ENTER.id, game, source, {
      stackable: false,
      mixins: [
        new OnEnterModifierMixin<T>(game, handler),
        new KeywordModifierMixin(game, KEYWORDS.ON_ENTER)
      ]
    });
  }
}
