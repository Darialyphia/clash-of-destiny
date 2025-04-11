import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import { OnAttackModifier } from '../../../modifier/modifiers/on-attack.modifier';
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
import { NoFollowup } from '../../followups/no-followup';
import { stormFlash } from './storm-flash';

export const aidenLv2: UnitBlueprint = {
  id: 'aiden-stormrider',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.HERO,
  affinity: AFFINITIES.NORMAL,
  name: 'Aiden, Stormrider',
  getDescription: () => {
    return `@Aiden Lineage@\n@On Attack@: Put a @Storm Flash@ in your hand.`;
  },
  staticDescription: `@Aiden Lineage@\n@On Attack@: Put a @Storm Flash@ in your hand.`,
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
  maxHp: 22,
  spellpower: 1,
  level: 2,
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
