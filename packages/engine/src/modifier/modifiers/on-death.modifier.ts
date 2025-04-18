import { KEYWORDS } from '../../card/card-keyword';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import {
  ARTIFACT_EVENTS,
  type Artifact,
  type ArtifactDestroyEvent
} from '../../player/artifact.entity';
import type { Unit } from '../../unit/entities/unit.entity';
import { UNIT_EVENTS } from '../../unit/unit-enums';
import type { UnitAfterDestroyEvent } from '../../unit/unit.events';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import {
  ArtifactSelfEventModifierMixin,
  UnitSelfEventModifierMixin
} from '../mixins/self-event.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class OnDeathModifier extends Modifier<Unit> {
  constructor(
    game: Game,
    source: AnyCard,
    options: {
      mixins?: ModifierMixin<Unit>[];
      handler: (event: UnitAfterDestroyEvent, modifier: Modifier<Unit>) => void;
    }
  ) {
    super(KEYWORDS.ON_DEATH.id, game, source, {
      stackable: false,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.ON_DEATH),
        new UnitSelfEventModifierMixin(game, {
          eventName: UNIT_EVENTS.AFTER_DESTROY,
          handler: event => {
            options.handler(event, this);
          }
        }),
        ...(options.mixins || [])
      ]
    });
  }
}

export class OnDestroyedModifier extends Modifier<Artifact> {
  constructor(
    game: Game,
    source: AnyCard,
    options: {
      mixins?: ModifierMixin<Artifact>[];
      handler: (event: ArtifactDestroyEvent, modifier: Modifier<Artifact>) => void;
    }
  ) {
    super(KEYWORDS.ON_DEATH.id, game, source, {
      stackable: false,
      mixins: [
        new ArtifactSelfEventModifierMixin(game, {
          eventName: ARTIFACT_EVENTS.AFTER_DESTROY,
          handler: event => {
            options.handler(event, this);
          }
        }),
        ...(options.mixins || [])
      ]
    });
  }
}
