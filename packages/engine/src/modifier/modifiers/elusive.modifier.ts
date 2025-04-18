import { KEYWORDS } from '../../card/card-keyword';
import type { AnyCard } from '../../card/entities/card.entity';
import { CombatDamage } from '../../combat/damage';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import type { Unit } from '../../unit/entities/unit.entity';
import { UNIT_EVENTS } from '../../unit/unit-enums';
import { GameEventModifierMixin } from '../mixins/game-event.mixin';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { UnitSelfEventModifierMixin } from '../mixins/self-event.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class ElusiveModifier extends Modifier<Unit> {
  constructor(
    game: Game,
    card: AnyCard,
    options?: { otherMixins?: Array<ModifierMixin<Unit>> }
  ) {
    super(KEYWORDS.ELUSIVE.id, game, card, {
      stackable: false,
      name: KEYWORDS.ELUSIVE.name,
      description: KEYWORDS.ELUSIVE.description,
      icon: 'keyword-elusive',
      mixins: [
        new UnitInterceptorModifierMixin(game, {
          key: 'damageReceived',
          interceptor: (value, ctx) => {
            if (game.gamePhaseSystem.turnPlayer.equals(this.target.player)) return value;
            if (ctx.damage instanceof CombatDamage && this.cellBehind) {
              return 0;
            }

            return value;
          }
        }),
        new UnitSelfEventModifierMixin(game, {
          eventName: UNIT_EVENTS.AFTER_RECEIVE_DAMAGE,
          handler: event => {
            if (game.gamePhaseSystem.turnPlayer.equals(this.target.player)) return;
            const { damage } = event.data;
            if (!(damage instanceof CombatDamage)) return;

            if (this.cellBehind) {
              this.target.teleport(this.cellBehind);
            }
          }
        }),
        ...(options?.otherMixins ?? [])
      ]
    });
  }

  private get cellBehind() {
    const behind = this.game.boardSystem.getCellBehind(this.target);
    if (!behind) return null;
    if (!behind.isWalkable) return null;
    if (behind.unit) return null;
    return behind;
  }
}
