import { KEYWORDS } from '../../card/card-keyword';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/entities/unit.entity';
import { AuraModifierMixin } from '../mixins/aura.mixin';
import { Modifier } from '../modifier.entity';

export class ZealModiier extends Modifier<Unit> {
  constructor(
    game: Game,
    source: AnyCard,
    private options: { onGainZeal: () => void; onLoseZeal: () => void }
  ) {
    super(KEYWORDS.ZEAL.id, game, source, {
      stackable: false,
      mixins: [
        new AuraModifierMixin(game, {
          canSelfApply: true,
          isElligible: unit => {
            return unit.equals(this.target) && this.isZealed;
          },
          onGainAura: options.onGainZeal,
          onLoseAura: options.onLoseZeal
        })
      ]
    });
  }

  get isZealed() {
    return this.target.position.isNearby(this.target.player.general);
  }
}
