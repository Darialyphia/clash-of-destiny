import type { AnyCard } from '../../card/entities/card.entity';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/entities/unit.entity';
import { UnitInterceptorModifierMixin } from '../mixins/interceptor.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class SimpleAttackBuffModifier extends Modifier<Unit> {
  constructor(
    modifierType: string,
    game: Game,
    card: AnyCard,
    options: {
      amount: number;
      name?: string;
      initialStacks?: number;
      mixins?: ModifierMixin<Unit>[];
    }
  ) {
    super(modifierType, game, card, {
      stackable: true,
      initialStacks: options.initialStacks ?? 1,
      icon: options.amount > 0 ? 'keyword-attack-buff' : 'keyword-attack-debuff',
      name: (options.name ?? options.amount > 0) ? 'Attack Buff' : 'Attack Debuff',
      description: `${options.amount > 0 ? '+' : '-'}${options.amount} Attack`,
      mixins: [
        new UnitInterceptorModifierMixin(game, {
          key: 'attack',
          interceptor(value, ctx, modifier) {
            return value + options.amount * modifier.stacks;
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
