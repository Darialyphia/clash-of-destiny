import { TARGETING_TYPE } from '../../../../targeting/targeting-strategy';
import { OpeningGambitModifier } from '../../../../modifier/modifiers/opening-gambit.modifier';
import type { UnitBlueprint } from '../../../card-blueprint';
import { CARD_KINDS, FACTIONS, RARITIES, UNIT_TYPES } from '../../../card.enums';
import type { Unit } from '../../../../unit/entities/unit.entity';
import { UnitInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { RingAOEShape } from '../../../../aoe/ring.aoe-shape';
import { minionFollowup } from '../../../card-utils';

export const primusFist: UnitBlueprint = {
  id: 'neutral_primus_fist',
  setId: 'CORE',
  name: 'Primus Fist',
  description: '@Opening Gambit@: Restore 2 Health to a unit.',
  kind: CARD_KINDS.UNIT,
  unitType: UNIT_TYPES.MINION,
  rarity: RARITIES.BASIC,
  faction: FACTIONS.F1,
  keywords: [],
  manaCost: 2,
  atk: 2,
  maxHp: 3,
  followup: minionFollowup(),
  getAoe(game, card) {
    return new RingAOEShape(game, card.player, {
      targetingType: TARGETING_TYPE.ALLY_MINION
    });
  },
  abilities: [],
  onInit(game, card) {
    const buff = new Modifier<Unit>('primus_fist_buff', game, card, {
      stackable: true,
      initialStacks: 1,
      name: 'Fist of the Primus',
      description: '+1 / +0',
      mixins: [
        new UnitInterceptorModifierMixin(game, {
          key: 'attack',
          interceptor(value, ctx, modifier) {
            return value + modifier.stacks;
          }
        })
      ]
    });

    card.addModifier(
      new OpeningGambitModifier(game, card, event => {
        event.units.forEach(unit => {
          unit.addModifier(buff);
        });
      })
    );
  },
  onPlay() {}
};
