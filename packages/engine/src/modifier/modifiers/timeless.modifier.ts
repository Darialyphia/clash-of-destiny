import { KEYWORDS } from '../../card/card-keyword';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import type { PlayerArtifact } from '../../player/player-artifact.entity';
import { PlayerArtifactInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { Modifier } from '../modifier.entity';

export class TimelessModifier extends Modifier<PlayerArtifact> {
  constructor(game: Game, card: AnyCard) {
    super(KEYWORDS.TIMELESS.id, game, card, {
      stackable: false,
      mixins: [
        new PlayerArtifactInterceptorModifierMixin(game, {
          key: 'shouldLoseDurabilityOnGeneralDamage',
          interceptor: () => !game.turnSystem.activePlayer.equals(this.target.player)
        })
      ]
    });
  }
}
