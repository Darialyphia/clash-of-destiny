import { PointAOEShape } from '../../../aoe/point.aoe-shape';
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
import { OnAttackModifier } from '../../../modifier/modifiers/on-attack.modifier';
import { NoFollowup } from '../../followups/no-followup';
import { stormFlash } from './storm-flash';

export const aidenLv1: UnitBlueprint = {
  id: 'aiden-child-of-the-storm',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.HERO,
  affinity: AFFINITIES.NORMAL,
  name: 'Aiden, Child of the Storm',
  getDescription: () => {
    return `@Aiden Lineage@\n@Inherited Effect@: @On Attack@: Put a @Fleeting@ @Storm Flash@ in your hand.`;
  },
  staticDescription: `@Aiden Lineage@\n@Inherited Effect@: @On Attack@: Put a @Fleeting@ @Storm Flash@ in your hand.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'unit-aiden-lv1',
  spriteId: 'aiden-lv1',
  spriteParts: {},
  rarity: RARITIES.RARE,
  collectable: true,
  destinyCost: 1,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  abilities: [],
  atk: 1,
  maxHp: 18,
  spellpower: 0,
  level: 1,
  job: CARD_JOBS.AVENGER,
  lineage: 'Aiden',
  getFollowup: () => {
    return new NoFollowup();
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT);
  },
  onInit() {},
  onPlay(game, card) {
    card.unit.addModifier(
      new OnAttackModifier(game, card, {
        handler() {
          const generatedCard = card.player.generateCard(stormFlash.id);
          card.player.cards.addToHand(generatedCard);
        }
      })
    );
  }
};
