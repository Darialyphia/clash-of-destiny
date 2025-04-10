import { KEYWORDS } from '../../card/card-keyword';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { ArtifactInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { Modifier } from '../modifier.entity';
import { Artifact } from '../../player/artifact.entity';

export class TrinketModifier extends Modifier<Artifact> {
  constructor(game: Game, source: AnyCard) {
    super(KEYWORDS.TRINKET.id, game, source, {
      stackable: false,
      mixins: [
        new ArtifactInterceptorModifierMixin(game, {
          key: 'shouldLosedurabilityOnDamage',
          interceptor: (val, ctx, modifier) => {
            return !modifier.target.player.equals(game.gamePhaseSystem.turnPlayer);
          }
        })
      ]
    });
  }
}
