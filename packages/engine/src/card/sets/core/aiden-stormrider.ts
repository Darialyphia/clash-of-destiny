import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import { OnEnterModifier } from '../../../modifier/modifiers/on-enter.modifier';
import { SwiftModifier } from '../../../modifier/modifiers/swift.modifier';
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

export const aidenLv2: UnitBlueprint = {
  id: 'aiden-stormrider',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.HERO,
  affinity: AFFINITIES.NORMAL,
  name: 'Aiden, Stormrider',
  getDescription: () => {
    return `@Aiden Lineage@\n @On Enter@: Give an allied minion @Swift@.`;
  },
  staticDescription: `@Aiden Lineage@\n@Inherited Effect@: @On Attack@: Put a @Storm Flash@ in your hand.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'unit-aiden-lv2',
  spriteId: 'aiden-lv2',
  spriteParts: {},
  rarity: RARITIES.EPIC,
  collectable: true,
  destinyCost: 2,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  abilities: [],
  atk: 2,
  maxHp: 21,
  spellpower: 1,
  level: 2,
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
        target.addModifier(new SwiftModifier(game, card));
      })
    );
  },
  onPlay() {}
};
