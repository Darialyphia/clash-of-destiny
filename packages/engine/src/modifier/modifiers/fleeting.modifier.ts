import { KEYWORDS } from '../../card/card-keyword';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';

export class FleetingModifier extends Modifier<AnyCard> {
  constructor(game: Game, source: AnyCard) {
    super(KEYWORDS.FLEETING.id, game, source, {
      stackable: false,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.FLEETING),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.PLAYER_END_TURN,
          handler: event => {
            if (!event.data.player.equals(this.target.player)) return;

            const location = this.target.player.cards.findCard(this.target.id);
            if (location?.location === 'hand') {
              this.target.player.cards.removeFromHand(this.target);
            }
            this.target.removeModifier(this);
          }
        })
      ]
    });
  }
}
