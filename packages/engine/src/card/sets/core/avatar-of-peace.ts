import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import { AuraModifierMixin } from '../../../modifier/mixins/aura.mixin';
import { UnitInterceptorModifierMixin } from '../../../modifier/mixins/interceptor.mixin';
import { UnitSelfEventModifierMixin } from '../../../modifier/mixins/self-event.mixin';
import { Modifier } from '../../../modifier/modifier.entity';
import { OnDeathModifier } from '../../../modifier/modifiers/on-death.modifier';
import { OnEnterModifier } from '../../../modifier/modifiers/on-enter.modifier';
import { SimpleAttackBuffModifier } from '../../../modifier/modifiers/simple-attack-buff.modifier';
import { VigilantModifier } from '../../../modifier/modifiers/vigilant.modifier';
import { TARGETING_TYPE } from '../../../targeting/targeting-strategy';
import { UNIT_EVENTS } from '../../../unit/unit-enums';
import type { UnitBlueprint } from '../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_JOBS,
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  UNIT_KINDS
} from '../../card.enums';
import { MinionFollowup } from '../../followups/minion.followup';

export const avatarOfPeace: UnitBlueprint = {
  id: 'avatar-of-peace',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.MINION,
  affinity: AFFINITIES.HARMONY,
  name: 'Avatar Of Peace',
  getDescription: () => {
    return `Units cannot attack unless their owner pays 2 mana.`;
  },
  staticDescription: `Units cannot attack unless their owner pays 2 mana.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'unit-avatar-of-peace',
  spriteId: 'avatar-of-peace',
  spriteParts: {},
  rarity: RARITIES.EPIC,
  collectable: true,
  manaCost: 4,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  atk: 0,
  maxHp: 5,
  job: CARD_JOBS.GUARDIAN,
  abilities: [],
  getFollowup: () => {
    return new MinionFollowup();
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT);
  },
  onInit() {},
  onPlay(game, card) {
    const debuff = new Modifier('avatar-of-peace-debuff', game, card, {
      stackable: false,
      mixins: [
        new UnitInterceptorModifierMixin(game, {
          key: 'canAttack',
          interceptor(value, ctx, modifier) {
            return modifier.target.player.mana.current >= 2;
          }
        }),
        new UnitSelfEventModifierMixin(game, {
          eventName: UNIT_EVENTS.BEFORE_ATTACK,
          handler(event, target) {
            target.player.mana.remove(2);
          }
        })
      ]
    });
    card.unit.addModifier(
      new Modifier('avatar-of-peace-aura', game, card, {
        stackable: false,
        mixins: [
          new AuraModifierMixin(game, {
            canSelfApply: true,
            isElligible() {
              return true;
            },
            onGainAura(unit) {
              unit.addModifier(debuff);
            },
            onLoseAura(unit) {
              unit.removeModifier(debuff);
            }
          })
        ]
      })
    );
  }
};
