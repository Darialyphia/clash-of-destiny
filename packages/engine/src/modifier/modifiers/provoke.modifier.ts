import { KEYWORDS } from '../../card/card-keyword';
import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/entities/unit.entity';
import { AuraModifierMixin } from '../mixins/aura.mixin';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { Modifier } from '../modifier.entity';

export class ProvokedModifier extends Modifier<Unit> {
  constructor(game: Game, card: AnyCard) {
    super(KEYWORDS.PROVOKED.id, game, card, {
      stackable: false,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.PROVOKED),
        new UnitInterceptorModifierMixin(game, {
          key: 'canAttack',
          interceptor: (value, { unit }) => {
            if (!value) return value;
            return (
              unit.position.isNearby(this.target.position) &&
              unit.hasModifier(ProvokeModifier)
            );
          }
        }),
        new UnitInterceptorModifierMixin(game, {
          key: 'canMove',
          interceptor: () => false
        })
      ]
    });
  }
}

export class ProvokeModifier extends Modifier<Unit> {
  constructor(game: Game, card: AnyCard) {
    super(KEYWORDS.PROVOKE.id, game, card, {
      stackable: false,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.PROVOKE),
        new AuraModifierMixin(game, {
          canSelfApply: false,
          isElligible: target =>
            target.position.isNearby(this.target.position) && target.isEnemy(this.target),
          onGainAura: target => {
            target.addModifier(new ProvokedModifier(game, card));
          },
          onLoseAura: target => {
            target.removeModifier(ProvokedModifier);
          }
        })
      ]
    });
  }
}
