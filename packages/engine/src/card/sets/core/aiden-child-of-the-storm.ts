import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import { OnEnterModifier } from '../../../modifier/modifiers/on-enter.modifier';
import { TARGETING_TYPE } from '../../../targeting/targeting-strategy';
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
import { AnywhereFollowup } from '../../followups/anywhere-followup';
import { SwiftModifier } from '../../../modifier/modifiers/swift.modifier';
import { UntilEndOfTurnModifierMixin } from '../../../modifier/mixins/until-end-of-turn.mixin';

export const aidenLv1: UnitBlueprint = {
  id: 'aiden-child-of-the-storm',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.HERO,
  affinity: AFFINITIES.NORMAL,
  name: 'Aiden, Child of the Storm',
  getDescription: () => {
    return `@Aiden Lineage@\n@On Enter@: Give an ally @Swift@ this turn.`;
  },
  staticDescription: `@Aiden Lineage@\n@On Enter@: Give an ally @Swift@ this turn.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'unit-aiden-lv1',
  spriteId: 'aiden-lv1',
  spriteParts: {},
  rarity: RARITIES.RARE,
  collectable: true,
  destinyCost: 1,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  abilities: [],
  atk: 2,
  maxHp: 18,
  spellpower: 0,
  level: 1,
  job: CARD_JOBS.AVENGER,
  lineage: 'Aiden',
  getFollowup: () => {
    return new AnywhereFollowup({
      targetingType: TARGETING_TYPE.ALLY_MINION,
      skippable: true
    });
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT);
  },
  onInit(game, card) {
    card.addModifier(
      new OnEnterModifier(game, card, event => {
        const [target] = event.data.affectedUnits;
        if (!target) return;
        target.addModifier(
          new SwiftModifier(game, card, {
            mixins: [new UntilEndOfTurnModifierMixin(game)]
          })
        );
      })
    );
  },
  onPlay() {}
};
