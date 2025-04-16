import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import { UnitSelfEventModifierMixin } from '../../../modifier/mixins/self-event.mixin';
import { Modifier } from '../../../modifier/modifier.entity';
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

export const nagaSkirmisher: UnitBlueprint = {
  id: 'naga-skirmisher',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.MINION,
  affinity: AFFINITIES.WATER,
  name: 'Naga Skirmisher',
  getDescription: () => {
    return `@Vigilant@.\nAfter this counterattacks, gain +1 ATK.`;
  },
  staticDescription: `@Vigilant@\nAfter this counterattacks, gain +1 ATK.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'unit-naga-skirmisher',
  spriteId: 'naga-skirmisher',
  spriteParts: {},
  rarity: RARITIES.COMMON,
  collectable: true,
  manaCost: 3,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  atk: 2,
  maxHp: 4,
  job: CARD_JOBS.FIGHTER,
  abilities: [],
  getFollowup: () => {
    return new MinionFollowup();
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT);
  },
  onInit() {},
  onPlay(game, card) {
    card.unit.addModifier(new VigilantModifier(game, card));
    card.unit.addModifier(
      new Modifier('naga-skirmisher-after-counterattack', game, card, {
        stackable: false,
        mixins: [
          new UnitSelfEventModifierMixin(game, {
            eventName: UNIT_EVENTS.AFTER_ATTACK,
            handler() {
              card.unit.addModifier(
                new SimpleAttackBuffModifier('naga-skirmisher-buff', game, card, {
                  amount: 1,
                  initialStacks: 1
                })
              );
            }
          })
        ]
      })
    );
  }
};
