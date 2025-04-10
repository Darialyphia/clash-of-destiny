import { PointAOEShape } from '../../../aoe/point.aoe-shape';
import { FleetingModifier } from '../../../modifier/modifiers/fleeting.modifier';
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
import { MinionFollowup } from '../../followups/minion.followup';
import { spark } from './spark';

export const flameJuggler: UnitBlueprint = {
  id: 'flame-juggler',
  kind: CARD_KINDS.UNIT,
  unitKind: UNIT_KINDS.MINION,
  affinity: AFFINITIES.FIRE,
  name: 'Flame Juggler',
  getDescription: () => {
    return `@On Enter@: Put a @Fleeting@ @Sparks@ in your hand.\n@Class Bonus@: Put two.`;
  },
  staticDescription: `@On Enter@: Put a @Fleeting@ @Spark@ in your hand.\n@Class Bonus@: Put two.`,
  setId: CARD_SETS.CORE,
  cardIconId: 'unit-flame-juggler',
  spriteId: 'unit-flame-juggler',
  spriteParts: {},
  rarity: RARITIES.RARE,
  collectable: true,
  manaCost: 4,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  abilities: [],
  atk: 2,
  maxHp: 3,
  job: CARD_JOBS.WANDERER,
  getFollowup: () => {
    return new MinionFollowup();
  },
  getAoe(game, card) {
    return new PointAOEShape(game, card.player, TARGETING_TYPE.UNIT);
  },
  onInit() {},
  onPlay(game, card) {
    const sparkCard = card.player.generateCard(spark.id);
    sparkCard.addModifier(new FleetingModifier(game, sparkCard));
    card.player.cards.addToHand(sparkCard);
  }
};
