import { KEYWORDS } from '../../card/card-keyword';
import type { AnyCard } from '../../card/entities/card.entity';
import { CombatDamage, PureDamage, SpellDamage } from '../../combat/damage';
import type { Game } from '../../game/game';
import type { Unit } from '../../unit/entities/unit.entity';
import { UNIT_EVENTS } from '../../unit/unit-enums';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import { UnitSelfEventModifierMixin } from '../mixins/self-event.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class OverheatModifier extends Modifier<Unit> {
  constructor(
    game: Game,
    card: AnyCard,
    options?: { mixins?: ModifierMixin<Unit>[]; initialStacks?: number }
  ) {
    super(KEYWORDS.OVERHEAT.id, game, card, {
      stackable: true,
      initialStacks: options?.initialStacks ?? 1,
      name: KEYWORDS.OVERHEAT.name,
      description: KEYWORDS.OVERHEAT.description,
      icon: 'keyword-burn',
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.OVERHEAT),
        new UnitSelfEventModifierMixin(game, {
          eventName: UNIT_EVENTS.AFTER_RECEIVE_DAMAGE,
          handler: (event, target) => {
            if (event.data.damage instanceof CombatDamage) return;
            if (event.data.damage.getFinalAmount(target) <= 0) return;
            this.triggerOverheat();
          }
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }

  triggerOverheat() {
    const stacks = this.stacks;
    this.target.removeModifier(this, true);
    const targets = [
      this.target,
      ...this.game.unitSystem
        .getNearbyUnits(this.target.position)
        .filter(unit => unit.isAlly(this.target))
    ];

    targets.forEach(unit => {
      unit.takeDamage(
        this.source,
        new PureDamage({ source: this.source, baseAmount: stacks })
      );
    });
  }
}
